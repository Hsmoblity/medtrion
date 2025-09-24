import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRelatedProductsByIds } from 'lib/woocommerce';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const idsParam = req.query.ids;
    let ids: number[] = [];
    if (typeof idsParam === 'string') ids = idsParam.split(',').map(s => Number(s)).filter(n => !isNaN(n));
    else if (Array.isArray(idsParam)) ids = idsParam.map(s => Number(s)).filter(n => !isNaN(n));

    if (!ids || ids.length === 0) {
        res.status(400).json({ error: 'Provide comma-separated database ids via `?ids=433,439`' });
        return;
    }

    try {
        const products = await fetchRelatedProductsByIds(ids);
        res.status(200).json({ ids, products });
    } catch (err: any) {
        console.error('Error fetching related products', err);
        res.status(500).json({ error: String(err) });
    }
}
