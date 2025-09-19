export function stripHtml(input: unknown) {
    if (!input) return '';
    const s = String(input);
    return s.replace(/<[^>]*>/g, '').trim();
}
