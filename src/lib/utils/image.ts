export function normalizeImageUrl(url: unknown): string {
    try {
        if (!url) return '/temp.webp'
        const s = String(url).trim()
        if (!s) return '/temp.webp'
        // If it's already an absolute URL with protocol, return it
        if (/^https?:\/\//i.test(s)) return s
        // If it starts with //, prepend https:
        if (/^\/\//.test(s)) return `https:${s}`
        // If it starts with a single slash, assume it's site-relative
        if (s.startsWith('/')) return s
        // Otherwise, attempt to parse as URL; if fails, fallback
        try {
            const u = new URL(s)
            return u.toString()
        } catch (e) {
            return '/temp.webp'
        }
    } catch (e) {
        return '/temp.webp'
    }
}

export default normalizeImageUrl
