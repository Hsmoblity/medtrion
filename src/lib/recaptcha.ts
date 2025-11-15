export async function verifyRecaptcha(token?: string): Promise<boolean> {
  if (!token) return false
  const secret = process.env.RECAPTCHA_SECRET || process.env.RECAPTCHA_SERVER_SECRET || ''
  if (!secret) return false

  try {
    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('response', token)

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
    })
    const json = await res.json()
    // For v3 you might want to inspect json.score
    return !!json.success
  } catch (e) {
    console.error('recaptcha verification error', e)
    return false
  }
}
