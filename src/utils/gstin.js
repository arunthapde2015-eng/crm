const GSTIN_PAN_START = 2;
const GSTIN_PAN_END = 12;

/** The PAN is characters 3–12 of a GSTIN: "27AAEAM3823E1ZT" → "AAEAM3823E". */
export function getPanFromGstin(gstin) {
  return gstin ? gstin.slice(GSTIN_PAN_START, GSTIN_PAN_END) : '';
}
