import styles from './SelectField.module.css';

/**
 * Labelled native select.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {{ value: string, label: string }[]} props.options
 * @param {boolean} [props.isLabelHidden=false] - Keep the label for screen readers only.
 * @param {string} [props.className] - Extra class names for the wrapper.
 */
export function SelectField({
  id,
  label,
  options,
  isLabelHidden = false,
  className = '',
  ...selectProps
}) {
  const wrapperClassNames = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassNames}>
      <label htmlFor={id} className={isLabelHidden ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      <select id={id} className={styles.select} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
