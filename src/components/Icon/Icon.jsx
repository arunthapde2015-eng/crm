const ICON_PATHS = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  chevronDown: 'M6 9l6 6 6-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
};

/**
 * Decorative stroke icon. Always hidden from assistive tech — label the parent control instead.
 *
 * @param {object} props
 * @param {keyof ICON_PATHS} props.name - Which icon to draw.
 * @param {number} [props.size=20] - Width and height in px.
 * @param {string} [props.className]
 */
export function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
