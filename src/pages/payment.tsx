import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getStripe from 'lib/stripe/getStripe';

export default function PaymentPage() {
    const router = useRouter();
    const { wpOrderId } = router.query as { wpOrderId?: string };
    const [message, setMessage] = useState('Preparing payment...');

    useEffect(() => {
        if (!wpOrderId) return;

        const doPayment = async () => {
            try {
                setMessage('Requesting payment session...');
                const res = await fetch('/api/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wpOrderId }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    console.error('Stripe API error', err);
                    setMessage('Failed to get payment session. See console for details.');
                    return;
                }

                const data = await res.json();
                const sessionId = data?.id || data?.sessionId;
                const publishableKey = data?.publishableKey;

                if (!sessionId) {
                    console.error('No session id returned', data);
                    setMessage('Payment session not available.');
                    return;
                }

                setMessage('Redirecting to Stripe...');
                const stripe = await getStripe(publishableKey);
                if (!stripe) {
                    setMessage('Stripe client not available.');
                    return;
                }

                const result = await stripe.redirectToCheckout({ sessionId });
                if (result?.error) {
                    console.error('Redirect error', result.error);
                    setMessage('Payment redirect failed.');
                }
            } catch (e) {
                console.error('Payment page error', e);
                setMessage('Payment failed.');
            }
        };

        doPayment();
    }, [wpOrderId]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 bg-white rounded shadow text-center">
                <h2 className="text-xl font-semibold mb-4">{message}</h2>
                <p className="text-sm text-gray-600">If you are not redirected automatically, try refreshing.</p>
            </div>
        </div>
    );
}
