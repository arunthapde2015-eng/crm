import styles from './Button.module.css';

/**
 * Shared button.
 *
 * @param {object} props
 * @param {'primary' | 'secondary' | 'ghost'} [props.variant='primary'] - Visual style.
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Native button type.
 * @param {string} [props.className] - Extra class names to merge.
 * @param {React.ReactNode} props.children - Button content.
 */
export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ');

  return (
    <button type={type} className={classNames} {...rest}>
      {children}
    </button>
  );
}
