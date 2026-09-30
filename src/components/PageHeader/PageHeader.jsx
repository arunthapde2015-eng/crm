import styles from './PageHeader.module.css';

/**
 * Page title block with an optional description and action area.
 *
 * @param {object} props
 * @param {string} props.title - Rendered as the page's h1.
 * @param {string} [props.eyebrow] - Short pill label shown above the title.
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.actions] - Buttons shown to the right on wide screens.
 */
export function PageHeader({ title, eyebrow, description, actions }) {
  return (
    <header className={styles.header}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
