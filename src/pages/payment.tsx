import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import CartItemsContext from 'contexts/cartItemsContext';

export default function PaymentPage() {
    const router = useRouter();
    const { wpOrderId } = router.query as { wpOrderId?: string };
    const { cart } = useContext(CartItemsContext);
    const [message, setMessage] = useState('Preparing payment (simulated)...');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address1: '',
        city: '',
        postalCode: '',
        country: '',
        note: '',
        email: '',
        phone: ''
    });

    const isValid = form.firstName && form.lastName && form.address1 && form.city && form.postalCode && form.country;

    useEffect(() => {
        setMessage('Enter shipping information to complete order');
    }, []);

    // Include attached option prices when computing subtotal
    const subtotal = cart && cart.length ? cart.reduce((s: number, it: any) => {
        const base = typeof it.price === 'number' ? it.price : Number(it.price || 0) || 0;
        let opts = 0;
        if (it.options && Array.isArray(it.options) && it.options.length > 0) {
            for (const o of it.options) {
                const op = typeof o.price === 'number' ? o.price : Number(o.price || o.priceModifier || 0) || 0;
                const oq = Number(o.quantity || 1) || 1;
                opts += op * oq;
            }
        }
        const configuredPerUnit = base + opts;
        return s + configuredPerUnit * (Number(it.quantity) || 1);
    }, 0) : 0;
    const taxRate = 0.13; // example tax 13%
    const tax = Math.round((subtotal * taxRate) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isValid || submitting) return;
        setSubmitting(true);
        setMessage('Creating order (simulated)...');
        try {
            const body = {
                lineItems: cart.map((i: any) => ({ slug: i.slug, productId: i.productId ?? undefined, quantity: i.quantity, price: i.price, title: i.title, options: i.options ?? undefined })),
                customer: {
                    shipping: {
                        first_name: form.firstName,
                        last_name: form.lastName,
                        address_1: form.address1,
                        city: form.city,
                        postcode: form.postalCode,
                        country: form.country,
                        phone: form.phone,
                    },
                    billing: form.email ? { email: form.email } : null
                },
                meta: {
                    simulatedPayment: true,
                    paymentMethod: 'card_dummy',
                    subtotal,
                    tax,
                    total,
                    note: form.note
                }
            };

            const r = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await r.json();
            const wpOrderIdResp = json?.order?.orderNumber || json?.order?.id;
            const href = `/success${wpOrderIdResp ? `?wpOrderId=${encodeURIComponent(String(wpOrderIdResp))}` : ''}`;
            router.replace(href);
            return;
        } catch (err) {
            console.warn('Payment/order create failed', err);
            setMessage('Failed to create order — try again');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center py-12">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left: form inputs */}
                <div className="lg:col-span-7 bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">{message}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium">First name</label>
                                <input value={form.firstName} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Last name</label>
                                <input value={form.lastName} onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} className="w-full border p-2 rounded" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Address</label>
                            <input value={form.address1} onChange={e => setForm(prev => ({ ...prev, address1: e.target.value }))} className="w-full border p-2 rounded" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-sm font-medium">City</label>
                                <input value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Postal code</label>
                                <input value={form.postalCode} onChange={e => setForm(prev => ({ ...prev, postalCode: e.target.value }))} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Country</label>
                                <input value={form.country} onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))} className="w-full border p-2 rounded" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Phone</label>
                            <input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full border p-2 rounded" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Email (optional)</label>
                            <input value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full border p-2 rounded" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Order note (optional)</label>
                            <textarea value={form.note} onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))} className="w-full border p-2 rounded" rows={3} />
                        </div>

                        <div className="flex justify-end">
                            <button disabled={!isValid || submitting} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{submitting ? 'Please wait...' : 'Place Order (simulate)'}</button>
                        </div>
                    </form>
                </div>

                {/* Right: cart summary */}
                <aside className="lg:col-span-5">
                    <div className="bg-white p-6 rounded shadow sticky top-20">
                        <h3 className="text-lg font-medium mb-3">Order summary</h3>
                        <div className="divide-y">
                            <div className="space-y-3 pb-3">
                                {(cart && cart.length) ? cart.map((it: any) => {
                                    const base = typeof it.price === 'number' ? it.price : Number(it.price || 0) || 0;
                                    let opts = 0;
                                    const optionLines: any[] = [];
                                    if (it.options && Array.isArray(it.options) && it.options.length > 0) {
                                        for (const o of it.options) {
                                            const op = typeof o.price === 'number' ? o.price : Number(o.price || o.priceModifier || 0) || 0;
                                            const oq = Number(o.quantity || 1) || 1;
                                            opts += op * oq;
                                            optionLines.push({ name: o.name || o.title || o.value, price: op, quantity: oq });
                                        }
                                    }
                                    const configuredPerUnit = base + opts;
                                    const lineTotal = configuredPerUnit * (Number(it.quantity) || 1);
                                    return (
                                        <div key={it.cartItemId || it.slug} className="pb-3">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">
                                                    <div className="font-medium">{it.title || it.name || it.slug}</div>
                                                    <div className="text-xs text-gray-500">Qty: {it.quantity ?? 1}</div>
                                                </div>
                                                <div className="text-sm">${Number(lineTotal).toFixed(2)}</div>
                                            </div>
                                            {optionLines.length > 0 && (
                                                <div className="mt-2 ml-3 text-xs text-gray-600">
                                                    {optionLines.map((ol, idx) => (
                                                        <div key={idx} className="flex justify-between">
                                                            <div>{ol.name}{ol.quantity && ol.quantity > 1 ? ` x${ol.quantity}` : ''}</div>
                                                            <div>${(ol.price * (ol.quantity || 1)).toFixed(2)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) : <div className="text-sm text-gray-500">Cart is empty</div>}
                            </div>

                            <div className="py-3">
                                <div className="flex justify-between text-sm"><div>Subtotal</div><div>${subtotal.toFixed(2)}</div></div>
                                <div className="flex justify-between text-sm"><div>Tax ({Math.round(taxRate * 100)}%)</div><div>${tax.toFixed(2)}</div></div>
                                <div className="flex justify-between text-base font-semibold mt-2"><div>Total</div><div>${total.toFixed(2)}</div></div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Payment (test)</h4>
                            <div className="border rounded p-3">
                                <label className="block text-xs text-gray-600">Card number</label>
                                <input className="w-full p-2 border rounded mt-1" placeholder="4242 4242 4242 4242" />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="p-2 border rounded" placeholder="MM/YY" />
                                    <input className="p-2 border rounded" placeholder="CVC" />
                                </div>
                                <div className="text-xs text-gray-500 mt-2">This is a dummy card input and will not process real payments.</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
