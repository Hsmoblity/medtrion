import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

/**
 * GraphQL Proxy API Route
 * 
 * Purpose: Bypass CORS restrictions for client-side GraphQL requests
 * 
 * Flow:
 * 1. Browser calls: http://localhost:3002/api/graphql-proxy (same-origin, no CORS)
 * 2. This API route calls: https://cms.medtrion.ca/graphql (server-to-server, no CORS)
 * 3. Returns GraphQL response to browser
 * 
 * Benefits:
 * - Bypasses CORS (browser calls same-origin endpoint)
 * - Handles SSL certificates (uses NODE_TLS_REJECT_UNAUTHORIZED)
 * - Server-side fetch (no browser security restrictions)
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'GraphQL proxy only accepts POST requests'
    });
  }

  try {
    const graphqlEndpoint = process.env.WP_GRAPHQL_URL || 
                           process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 
                           'https://cms.medtrion.ca/graphql';

    // Handle SSL certificate issues for server-side requests
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
      // Use node-fetch with custom HTTPS agent for SSL bypass
      const nodeFetch = require('node-fetch');
      const { Agent } = require('https');
      
      const agent = new Agent({
        rejectUnauthorized: false
      });
      
      const response = await nodeFetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization as string }),
        },
        body: JSON.stringify(req.body),
        agent: agent, // node-fetch accepts agent property
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GraphQL Proxy Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return res.status(response.status).json({ 
          error: 'GraphQL request failed',
          details: errorText 
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } else {
      // Standard fetch for production with valid certificates
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization as string }),
        },
        body: JSON.stringify(req.body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: 'GraphQL request failed',
          details: errorText 
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error: any) {
    console.error('GraphQL Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Failed to proxy GraphQL request'
    });
  }
}

// Agent Signature: 131024 - Fullstack - CORS_Bypass_GraphQL_Proxy

