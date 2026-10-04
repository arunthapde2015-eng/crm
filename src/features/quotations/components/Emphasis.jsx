const BOLD_MARKER = /\*\*(.+?)\*\*/g;

/**
 * Plain text where **double-asterisk** spans render bold. Builds React elements, so text from
 * users is never treated as HTML.
 *
 * @param {object} props
 * @param {string} props.text
 */
export function Emphasis({ text }) {
  const parts = [];
  let lastIndex = 0;
  for (const match of text.matchAll(BOLD_MARKER)) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

/** A point that is bold from start to end acts as a sub-heading rather than a bullet. */
export function isSubheading(point) {
  return /^\*\*[^*]+\*\*$/.test(point);
}
