"use client";

import React, { useEffect, useState, useContext } from 'react';
import CartContext from 'contexts/cartItemsContext';
import CartVisibilityContext from 'contexts/cartVisibilityContext';
import Types from 'reducers/cart/types';
import { normalizeImageUrl } from 'lib/utils/image';

interface AddOnProduct {
    id: string | number;
    title: string;
    price: number;
    sku?: string;
    type?: 'simple' | 'variable' | 'group';
    variations?: any[];
    hidden?: boolean;
    image?: string;
}

interface Props {
    relatedIds: Array<string | number>;
    fetchByIds: (ids: Array<string | number>) => Promise<AddOnProduct[]>;
    parentProductId?: string | number;
}

const ProductOptions: React.FC<Props> = ({ relatedIds, fetchByIds, parentProductId }) => {
    const { dispatch } = useContext(CartContext);
    const { toggleCartVisibility } = useContext(CartVisibilityContext);
    const [addOns, setAddOns] = useState<AddOnProduct[]>([]);
    const [selected, setSelected] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!relatedIds || relatedIds.length === 0) return;
        let mounted = true;
        fetchByIds(relatedIds).then((res) => {
            if (!mounted) return;
            setAddOns(res || []);
        }).catch(() => { });
        return () => { mounted = false; };
    }, [relatedIds.join?.(',')]);

    const toggleCheckbox = (id: string | number) => {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectRadio = (groupKey: string, id: string | number) => {
        setSelected(prev => ({ ...prev, [groupKey]: id }));
    };

    const addSelectedToCart = () => {
        const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);
        // Add parent if provided
        if (parentProductId) {
            dispatch({ type: Types.addToCart, payload: { cartItemId: uuid(), productId: parentProductId, quantity: 1 } });
        }
        // Add each selected add-on
        for (const a of addOns) {
            if (a.type === 'variable') {
                // variable add-ons may be grouped by attribute; select by selected[a.id]
                const sel = selected[a.id] || null;
                const payload: any = { cartItemId: uuid(), productId: a.id, title: a.title, price: a.price, sku: a.sku };
                if (sel) payload.variationId = sel;
                dispatch({ type: Types.addToCart, payload });
            } else if (a.type === 'group') {
                // group: selected linked products might be under selected[a.id] as array
                const sel = selected[a.id] || [];
                if (Array.isArray(sel)) {
                    for (const pid of sel) {
                        const linked = addOns.find(x => String(x.id) === String(pid));
                        if (!linked) continue;
                        dispatch({ type: Types.addToCart, payload: { cartItemId: uuid(), productId: linked.id, title: linked.title, price: linked.price } });
                    }
                }
            } else {
                // simple
                if (selected[a.id]) {
                    dispatch({ type: Types.addToCart, payload: { cartItemId: uuid(), productId: a.id, title: a.title, price: a.price } });
                }
            }
        }
        toggleCartVisibility();
    };

    if (!relatedIds || relatedIds.length === 0) return null;

    return (
        <div className="p-4 border rounded-lg bg-white">
            <h3 className="font-semibold mb-3">Product Options</h3>
            <div className="space-y-3">
                {addOns.map((a) => (
                    <div key={String(a.id)} className="flex items-center space-x-3">
                        {a.type === 'variable' ? (
                            // render radio per variation
                            <div>
                                <p className="font-medium">{a.title} {a.price ? ` - $${(a.price / 100).toFixed(2)}` : ''}</p>
                                <div className="flex gap-2 mt-1">
                                    {a.variations && a.variations.map((v: any) => (
                                        <label key={v.id} className="inline-flex items-center space-x-2 border rounded px-2 py-1 cursor-pointer">
                                            <input type="radio" name={`var-${a.id}`} checked={selected[a.id] === String(v.databaseId ?? v.id)} onChange={() => selectRadio(a.id as any, String(v.databaseId ?? v.id))} />
                                            <span className="text-sm">{v.attributes?.map((x: any) => x.value).join(' / ') || v.sku}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : a.type === 'group' ? (
                            <div>
                                <p className="font-medium">{a.title}</p>
                                <div className="mt-1">
                                    {a.variations && a.variations.map((linked: any) => (
                                        <label key={linked.id} className="inline-flex items-center space-x-2 mr-3">
                                            <input type="checkbox" checked={Array.isArray(selected[a.id]) ? selected[a.id].includes(String(linked.id)) : false} onChange={() => {
                                                const prev = Array.isArray(selected[a.id]) ? [...selected[a.id]] : [];
                                                const sid = String(linked.id);
                                                const idx = prev.indexOf(sid);
                                                if (idx === -1) prev.push(sid); else prev.splice(idx, 1);
                                                setSelected(prevState => ({ ...prevState, [a.id]: prev }));
                                            }} />
                                            <span className="text-sm">{linked.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <label className="inline-flex items-center space-x-2">
                                <input type="checkbox" checked={!!selected[a.id]} onChange={() => toggleCheckbox(a.id)} />
                                <img src={a.image ? normalizeImageUrl(a.image) : '/temp.webp'} className="w-10 h-10 object-cover" />
                                <div>
                                    <div className="font-medium">{a.title}</div>
                                    <div className="text-sm text-gray-600">{a.sku ? `SKU: ${a.sku}` : ''} {a.price ? ` • $${(a.price / 100).toFixed(2)}` : ''}</div>
                                </div>
                            </label>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 text-right">
                <button onClick={addSelectedToCart} className="px-4 py-2 bg-black text-white rounded">Add Selected Options</button>
            </div>
        </div>
    );
};

export default ProductOptions;
