/** Canonical warranty duration used by marketing, SEO, and on-page copy. */
export const WARRANTY_TIME = "2-year";

function titleCaseWarrantyUnit(warrantyTime: string): string {
  const unit = warrantyTime.split("-")[1] ?? "year";
  return `${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;
}

/** Card and section title, e.g. "2-Year Warranty". */
export function warrantyTimeTitle(warrantyTime: string = WARRANTY_TIME): string {
  const [amount, unit = "year"] = warrantyTime.split("-");
  const titledUnit = `${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;
  return `${amount}-${titledUnit} Warranty`;
}

/** FAQ heading, e.g. "2 Year Warranty". */
export function warrantyTimeHeading(warrantyTime: string = WARRANTY_TIME): string {
  const amount = warrantyTime.split("-")[0] ?? warrantyTime;
  return `${amount} ${titleCaseWarrantyUnit(warrantyTime)} Warranty`;
}

/** Hero statistic, e.g. "2 Years". */
export function warrantyTimeStat(warrantyTime: string = WARRANTY_TIME): string {
  const amount = warrantyTime.split("-")[0] ?? warrantyTime;
  return `${amount} ${titleCaseWarrantyUnit(warrantyTime)}s`;
}

/** Short value, e.g. "2 years". */
export function warrantyTimeValue(warrantyTime: string = WARRANTY_TIME): string {
  const amount = warrantyTime.split("-")[0] ?? warrantyTime;
  const unit = warrantyTime.split("-")[1] ?? "year";
  return `${amount} ${unit}s`;
}

/** Month form of a year-based duration, e.g. "24-month". */
export function warrantyTimeMonths(warrantyTime: string = WARRANTY_TIME): string {
  const [amount, unit = "year"] = warrantyTime.split("-");
  if (unit.startsWith("month")) {
    return warrantyTime;
  }
  const years = Number(amount);
  if (!Number.isFinite(years)) {
    return warrantyTime;
  }
  return `${years * 12}-month`;
}
