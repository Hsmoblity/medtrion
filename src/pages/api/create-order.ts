import { NextApiRequest, NextApiResponse } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(process.env.WP_GRAPHQL_URL || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lineItems, customer } = req.body;

    const mutation = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
        order {
          id
          orderNumber
          status
        }
        result
      }
    }
  `;

    const input = {
        lineItems: lineItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            variationId: item.variationId || undefined,
        })),
        customer,
    };

    try {
        const data = await client.request(mutation, { input }) as any;
        res.status(200).json(data.createOrder);
    } catch (error: any) {
        res.status(500).json({ error: error.message, details: error.response?.errors });
    }
}
