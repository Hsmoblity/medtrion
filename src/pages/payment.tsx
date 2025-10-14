import { useRouter } from 'next/router';
import { useCartStore } from '../stores/cartStore';
import PaymentPage from '../components/payment/PaymentPage';

export default function Payment() {
    const router = useRouter();
    const { cart } = useCartStore();

    // Handle successful Stripe payment by creating order record
    const handlePaymentSuccess = async (paymentIntent: any) => {
        try {
            console.log('Payment successful, creating order record...', paymentIntent);
            
            // Calculate order totals using the same logic as payment intent
            const subtotal = cart.reduce((s: number, item: any) => {
                const base = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0;
                let opts = 0;
                if (item.options && Array.isArray(item.options)) {
                    opts = item.options.reduce((optSum: number, option: any) => {
                        const optPrice = Number(option.priceModifier || 0) || 0;
                        const optQuantity = Number(option.quantity || 1) || 1;
                        return optSum + (optPrice * optQuantity);
                    }, 0);
                }
                const configuredPerUnit = base + opts;
                return s + configuredPerUnit * (Number(item.quantity) || 1);
            }, 0);
            
            const taxRate = 0.13;
            const tax = Math.round((subtotal * taxRate) * 100) / 100;
            const total = Math.round((subtotal + tax) * 100) / 100;

            const body = {
                lineItems: cart.map((item: any) => ({ 
                    slug: item.slug, 
                    productId: item.productId ?? undefined, 
                    quantity: item.quantity, 
                    price: item.price, 
                    title: item.title, 
                    options: item.options ?? undefined 
                })),
                customer: {
                    // Get customer info from Stripe payment intent if available
                    shipping: paymentIntent.shipping || {},
                    billing: { email: paymentIntent.receipt_email || '' }
                },
                meta: {
                    stripePaymentIntentId: paymentIntent.id,
                    stripePaymentStatus: paymentIntent.status,
                    paymentMethod: 'stripe',
                    subtotal,
                    tax,
                    total
                }
            };

            const response = await fetch('/api/create-order', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(body) 
            });
            
            const json = await response.json();
            const wpOrderIdResp = json?.order?.orderNumber || json?.order?.id;
            const href = `/success${wpOrderIdResp ? `?wpOrderId=${encodeURIComponent(String(wpOrderIdResp))}&paymentIntent=${paymentIntent.id}` : `?paymentIntent=${paymentIntent.id}`}`;
            router.replace(href);
        } catch (err) {
            console.warn('Order creation failed after successful payment', err);
            // Still redirect to success page with payment intent info
            router.replace(`/success?paymentIntent=${paymentIntent.id}`);
        }
    };

    return <PaymentPage onPaymentSuccess={handlePaymentSuccess} />;
}
