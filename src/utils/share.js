const INDIA_DIALING_CODE = '91';
const MOBILE_DIGITS = 10;

/**
 * A WhatsApp chat link with the message pre-filled, or null without a 10-digit Indian mobile.
 * Attachments can't be added this way; the user attaches the PDF in WhatsApp.
 */
export function getWhatsAppUrl(phone, message) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length !== MOBILE_DIGITS) return null;
  return `https://wa.me/${INDIA_DIALING_CODE}${digits}?text=${encodeURIComponent(message)}`;
}

/** A new-email link with subject and body pre-filled; the recipient may be blank. */
export function getMailtoUrl(email, subject, body) {
  return `mailto:${encodeURIComponent(email ?? '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
