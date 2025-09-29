import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRelatedProductsByIds } from 'lib/woocommerce';
import { shouldEnableDebugEndpoints } from '../../../lib/utils/environment-validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Use centralized environment validation
    if (!shouldEnableDebugEndpoints()) {
        return res.status(404).json({ 
            error: 'Debug endpoint disabled',
            message: 'Debug endpoints are only available in development mode',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    }
    const idsParam = req.query.ids;
    let ids: number[] = [];
    if (typeof idsParam === 'string') ids = idsParam.split(',').map(s => Number(s)).filter(n => !isNaN(n));
    else if (Array.isArray(idsParam)) ids = idsParam.map(s => Number(s)).filter(n => !isNaN(n));

    if (!ids || ids.length === 0) {
        res.status(400).json({ 
            error: 'Provide comma-separated database ids via `?ids=433,439`',
            ids: [],
            products: []
        });
        return;
    }

    try {
        const products = await fetchRelatedProductsByIds(ids);
        res.status(200).json({ 
            ids, 
            products: products || [],
            success: true
        });
    } catch (err: any) {
        console.error('Error fetching related products', err);
        res.status(500).json({ 
            error: 'Failed to fetch related products',
            ids,
            products: [],
            success: false
        });
    }
}
