import styles from './DataTable.module.css';

/**
 * Bordered table that scrolls sideways inside its own box on narrow screens,
 * so the page itself never scrolls horizontally. Pass `thead`/`tbody` as children.
 *
 * All base styles have zero specificity, so feature classes (cell alignment,
 * min-width, background) override them without `!important` or extra selectors.
 *
 * @param {object} props
 * @param {string} props.caption - Accessible table name (visually hidden).
 * @param {string} [props.className] - Extra classes for the scroll container.
 * @param {string} [props.tableClassName] - Extra classes for the table, e.g. a min-width.
 * @param {React.ReactNode} props.children
 */
export function DataTable({ caption, className = '', tableClassName = '', children }) {
  const scrollerClassNames = [styles.scroller, className].filter(Boolean).join(' ');
  const tableClassNames = [styles.table, tableClassName].filter(Boolean).join(' ');

  return (
    <div className={scrollerClassNames}>
      <table className={tableClassNames}>
        <caption className="visually-hidden">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
