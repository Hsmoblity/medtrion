type RateRecord = { count: number; resetAt: number }

const store = new Map<string, RateRecord>()

export async function rateLimit(key: string, max = Number(process.env.RATE_LIMIT_MAX || 10), windowSec = Number(process.env.RATE_LIMIT_WINDOW_SEC || 3600)) {
  const now = Date.now()
  const rec = store.get(key) || { count: 0, resetAt: now + windowSec * 1000 }
  if (now > rec.resetAt) {
    rec.count = 0
    rec.resetAt = now + windowSec * 1000
  }
  rec.count += 1
  store.set(key, rec)
  if (rec.count > max) {
    return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) }
  }
  return { ok: true }
}

// Simple helper to support earlier usage style
export const rateLimitWrapper = rateLimit
export const rateLimitDefault = { max: Number(process.env.RATE_LIMIT_MAX || 10), windowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC || 3600) }
