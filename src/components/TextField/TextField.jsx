import styles from './TextField.module.css';

/**
 * Labelled text input, or a textarea when `rows` is given.
 *
 * @param {object} props
 * @param {string} props.id - Input id, also used to link the label.
 * @param {string} props.label - Visible label text.
 * @param {number} [props.rows] - Render a textarea with this many rows.
 * @param {string} [props.className] - Extra class names for the wrapper.
 */
export function TextField({ id, label, rows, className = '', ...inputProps }) {
  const isMultiline = rows !== undefined;
  const wrapperClassNames = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassNames}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {isMultiline ? (
        <textarea id={id} rows={rows} className={styles.input} {...inputProps} />
      ) : (
        <input id={id} className={styles.input} {...inputProps} />
      )}
    </div>
  );
}
