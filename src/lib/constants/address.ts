const FALLBACK_STREET = "Unit 210,2030 Bristol Cir";
const FALLBACK_LOCALITY = "Oakville";
const FALLBACK_REGION = "ON";
const FALLBACK_POSTAL_CODE = "L6H 6P5";

/**
 * Plain address used when WordPress GraphQL contactAddress is missing.
 */
export const FALLBACK_ADDRESS = `${FALLBACK_STREET}, ${FALLBACK_LOCALITY}, ${FALLBACK_REGION} ${FALLBACK_POSTAL_CODE}`;

/**
 * Labeled address matching the CMS contactAddress field shape.
 */
export const FALLBACK_CONTACT_ADDRESS = `${FALLBACK_STREET},City:${FALLBACK_LOCALITY} ${FALLBACK_REGION},Postal:${FALLBACK_POSTAL_CODE}`;

export const FALLBACK_ADDRESS_PARTS = {
  street: FALLBACK_STREET,
  locality: FALLBACK_LOCALITY,
  region: FALLBACK_REGION,
  postalCode: FALLBACK_POSTAL_CODE,
  country: "CA",
} as const;
