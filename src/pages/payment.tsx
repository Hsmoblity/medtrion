import { useRouter } from 'next/router';
import { useCartStore } from '../stores/cartStore';
import PaymentPage from '../components/payment/PaymentPage';

export default function Payment() {
    const router = useRouter();
    const { cart, clearCart } = useCartStore();

    // Handle successful Stripe payment by creating order record
    const handlePaymentSuccess = async (paymentIntent: any) => {
        try {
            console.log('🎉 Payment Success Handler Called!');
            console.log('📄 Payment Intent Details:', {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                customer: paymentIntent.customer
            });
            console.log('🛒 Cart Items:', cart);
            
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

            console.log('💰 Order Totals:', { subtotal, tax, total });

            const orderBody = {
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
                    paymentCompletedAt: new Date().toISOString(),
                    subtotal,
                    tax,
                    total
                }
            };

            console.log('📤 Creating order with body:', orderBody);

            // Step 1: Create the order
            const response = await fetch('/api/create-order', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(orderBody) 
            });
            
            console.log('📥 Order API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Order API returned ${response.status}: ${response.statusText}`);
            }
            
            const json = await response.json();
            console.log('📋 Order API Response:', json);
            
            const wpOrderIdResp = json?.order?.orderNumber || json?.order?.id;
            
            // Step 2: Update payment intent and order status
            console.log('🔄 Updating payment and order status...');
            
            try {
                const statusUpdateResponse = await fetch('/api/payment/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        orderId: wpOrderIdResp,
                        status: paymentIntent.status
                    })
                });

                const statusResult = await statusUpdateResponse.json();
                console.log('✅ Status update result:', statusResult);

                if (statusResult.success) {
                    console.log('🎯 Payment and order status updated successfully!');
                } else {
                    console.warn('⚠️ Status update failed:', statusResult.error);
                }
            } catch (statusError) {
                console.error('❌ Failed to update payment/order status:', statusError);
                // Don't fail the entire flow if status update fails
            }
            
            // Step 3: Clear cart and redirect to success
            console.log('🧹 Clearing cart...');
            clearCart();
            
            const href = `/success${wpOrderIdResp ? `?wpOrderId=${encodeURIComponent(String(wpOrderIdResp))}&paymentIntent=${paymentIntent.id}` : `?paymentIntent=${paymentIntent.id}`}`;
            
            console.log('🔄 Redirecting to:', href);
            router.replace(href);
            
        } catch (err) {
            console.error('❌ Order creation failed after successful payment:', err);
            console.error('Stack trace:', err);
            
            // Even if order creation fails, try to update payment status
            try {
                await fetch('/api/payment/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        status: paymentIntent.status
                    })
                });
                console.log('✅ Payment status updated despite order creation failure');
            } catch (statusError) {
                console.error('❌ Failed to update payment status after order failure:', statusError);
            }
            
            // Still redirect to success page with payment intent info
            const fallbackUrl = `/success?paymentIntent=${paymentIntent.id}&orderFailed=true`;
            console.log('🔄 Fallback redirect to:', fallbackUrl);
            router.replace(fallbackUrl);
        }
    };

    return <PaymentPage onPaymentSuccess={handlePaymentSuccess} />;
}
