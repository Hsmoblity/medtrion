import type { NextApiRequest, NextApiResponse } from 'next'
import { consultationSchema } from '../../lib/validation/consultation-schema'
import { verifyRecaptcha } from '../../lib/recaptcha'
import { rateLimit } from '../../lib/rate-limit'

type Data = {
  success: boolean
  message?: string
  error?: string
}

const WP_ENDPOINT_PATH = '/wp-json/hsm/v1/submit-consultation'

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'method_not_allowed' })
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string

  // Rate limit by IP
  const rl = await rateLimit(ip)
  if (!rl.ok) {
    res.setHeader('Retry-After', String(rl.retryAfter || 60))
    return res.status(429).json({ success: false, error: 'rate_limited' })
  }

  const parsed = consultationSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'validation_error', message: JSON.stringify(parsed.error.format()) })
  }

  const payload = parsed.data

  // Optional reCAPTCHA verification if token provided
  if (payload.gRecaptchaToken) {
    const ok = await verifyRecaptcha(payload.gRecaptchaToken)
    if (!ok) {
      return res.status(401).json({ success: false, error: 'recaptcha_failed' })
    }
  }

  // Forward to WordPress REST endpoint
  const wpBase = process.env.WP_API_URL
  if (!wpBase) {
    return res.status(500).json({ success: false, error: 'wp_endpoint_not_configured' })
  }

  const url = `${wpBase.replace(/\/$/, '')}${WP_ENDPOINT_PATH}`

  // Build auth headers if available (Application Password or Basic)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.WP_API_USER && process.env.WP_API_APP_PASSWORD) {
    const creds = `${process.env.WP_API_USER}:${process.env.WP_API_APP_PASSWORD}`
    headers['Authorization'] = 'Basic ' + Buffer.from(creds).toString('base64')
  }
  // Shared secret header for additional server-to-server trust (optional)
  if (process.env.HSM_API_SHARED_SECRET) {
    headers['X-HSM-API-KEY'] = process.env.HSM_API_SHARED_SECRET
  }

  try {
    const wpRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload }),
    })

    if (!wpRes.ok) {
      const text = await wpRes.text()
      console.error('WP endpoint error', wpRes.status, text)
      return res.status(502).json({ success: false, error: 'wp_forward_error' })
    }

    const json = await wpRes.json()
    return res.status(200).json({ success: true, message: json.message || 'queued' })
  } catch (err) {
    console.error('submit-consultation error', err)
    return res.status(500).json({ success: false, error: 'server_error' })
  }
}
