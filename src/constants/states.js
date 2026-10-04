// States offered in address and place-of-supply pickers.
export const INDIAN_STATES = [
  'Delhi',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
];

// GST state codes (also the first two digits of a GSTIN), printed with the place of supply.
export const GST_STATE_CODES = {
  Delhi: '07',
  Goa: '30',
  Gujarat: '24',
  Karnataka: '29',
  'Madhya Pradesh': '23',
  Maharashtra: '27',
  'Tamil Nadu': '33',
  Telangana: '36',
};

/** "Maharashtra ( 27 )", as printed on GST documents. */
export function formatPlaceOfSupply(state) {
  const code = GST_STATE_CODES[state];
  return code ? `${state} ( ${code} )` : state;
}
