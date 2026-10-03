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
  const parts: Record<string, string[]> = {};
  let currentKey = "street";

  raw.split(",").forEach((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) return;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx !== -1) {
      currentKey = trimmed.slice(0, colonIdx).trim().toLowerCase();
      const value = trimmed.slice(colonIdx + 1).trim();
      if (!parts[currentKey]) parts[currentKey] = [];
      if (value) parts[currentKey].push(value);
      return;
    }

    if (!parts[currentKey]) parts[currentKey] = [];
    parts[currentKey].push(trimmed);
  });

  const join = (key: string) => (parts[key] ?? []).join(", ");
  const street = join("street");
  const city = join("city");
  const postal = join("postal");
  return {
    street,
    city,
    postal,
    full: [street, city, postal].filter(Boolean).join(", "),
  };
}
