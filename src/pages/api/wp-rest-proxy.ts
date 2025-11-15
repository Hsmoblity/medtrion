import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Proxy for WordPress REST API calls
 * Allows client-side to call WordPress API without exposing the WP URL
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path parameter required' })
  }

  // Use WP_API_URL for consistency with API manager
  const baseUrl = process.env.WP_API_URL || process.env.WP_REST_BASE_URL
  if (!baseUrl) {
    return res.status(500).json({ error: 'WP_API_URL not configured' })
  }

  try {
    const wpUrl = `${baseUrl.replace(/\/$/, '')}${path}`
    const response = await fetch(wpUrl)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'WordPress API error' })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('WP REST proxy error:', error)
    return res.status(500).json({ error: 'Failed to fetch from WordPress' })
  }
}
