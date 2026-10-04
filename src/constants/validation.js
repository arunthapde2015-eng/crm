export const MOBILE_PATTERN = /^\d{10}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 2-digit state code, 10-character PAN, entity number, "Z", checksum character.
// A string so it can also go in an input's `pattern` attribute.
export const GSTIN_PATTERN = '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]';
export const GSTIN_REGEX = new RegExp(`^${GSTIN_PATTERN}$`);
