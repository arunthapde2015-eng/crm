const MOBILE_GROUP_SIZE = 5;
const INDIA_DIALING_CODE = '+91';

/** "9823010001" → "98230 10001" */
export function formatMobile(mobile) {
  return `${mobile.slice(0, MOBILE_GROUP_SIZE)} ${mobile.slice(MOBILE_GROUP_SIZE)}`;
}

/** "9823010001" → "tel:+919823010001", for click-to-call links. */
export function getTelHref(mobile) {
  return `tel:${INDIA_DIALING_CODE}${mobile}`;
}
