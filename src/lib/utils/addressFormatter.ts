/**
 * Utility to parse and clean addresses with labeled fields
 * Converts "Street:...,City:...,Postal:..." format to clean display format
 */

export function removeAddressLabels(addressString: string): string {
  if (!addressString) return '';

  // Pattern to match labels like "Street:", "City:", "Postal:" etc.
  // Removes the label prefix but keeps the value
  return addressString
    .split(',')
    .map(segment => {
      // Remove the label part (everything before and including the colon)
      const colonIdx = segment.indexOf(':');
      if (colonIdx !== -1) {
        return segment.slice(colonIdx + 1).trim();
      }
      return segment.trim();
    })
    .filter(Boolean)
    .join(', ');
}

export function parseAddress(raw: string): {
  street: string;
  city: string;
  postal: string;
  full: string;
} {
  const parts: Record<string, string> = {};
  raw.split(',').forEach((segment) => {
    const colonIdx = segment.indexOf(':');
    if (colonIdx !== -1) {
      const key = segment.slice(0, colonIdx).trim().toLowerCase();
      const val = segment.slice(colonIdx + 1).trim();
      parts[key] = val;
    }
  });
  const street = parts['street'] ?? '';
  const city = parts['city'] ?? '';
  const postal = parts['postal'] ?? '';
  return {
    street,
    city,
    postal,
    full: [street, city, postal].filter(Boolean).join(', '),
  };
}
