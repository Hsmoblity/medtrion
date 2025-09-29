/**
 * Simple feature flag system for HSM Mobility storefront
 */

export interface FeatureFlags {
  homepage_showcase_layout: boolean;
  // Add more feature flags as needed
}

// Default feature flag values
const DEFAULT_FLAGS: FeatureFlags = {
  homepage_showcase_layout: true, // Enable by default for now
};

/**
 * Get feature flag value from environment or default
 */
export function getFeatureFlag(flagName: keyof FeatureFlags): boolean {
  // Check environment variable first (for build-time flags)
  const envValue = process.env[`NEXT_PUBLIC_FEATURE_${flagName.toUpperCase()}`];
  if (envValue !== undefined) {
    return envValue === 'true';
  }
  
  // Check localStorage for client-side overrides (development)
  if (typeof window !== 'undefined') {
    const storageKey = `feature_flag_${flagName}`;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      return stored === 'true';
    }
  }
  
  // Return default
  return DEFAULT_FLAGS[flagName];
}

/**
 * Set feature flag override in localStorage (development only)
 */
export function setFeatureFlagOverride(flagName: keyof FeatureFlags, value: boolean): void {
  if (typeof window !== 'undefined') {
    const storageKey = `feature_flag_${flagName}`;
    localStorage.setItem(storageKey, value.toString());
  }
}

/**
 * Clear all feature flag overrides (development only)
 */
export function clearFeatureFlagOverrides(): void {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('feature_flag_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}