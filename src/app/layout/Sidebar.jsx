import { APP_NAME, APP_TAGLINE } from '@/constants/session';
import { NAV_GROUPS } from '@/constants/navigation';

import styles from './Sidebar.module.css';

function NavItem({ item, isActive, onNavigate }) {
  const hasBadge = item.badgeCount > 0;

  return (
    <li>
      <button
        type="button"
        className={styles.item}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(item.id)}
      >
        <span>{item.label}</span>
        {hasBadge && (
          <span className={styles.badge}>
            {item.badgeCount}
            <span className="visually-hidden"> pending</span>
          </span>
        )}
      </button>
    </li>
  );
}

/**
 * Primary side navigation, grouped by business area.
 *
 * @param {object} props
 * @param {string} props.id - Element id, referenced by the header's toggle button.
 * @param {boolean} props.isOpen - Whether the sidebar is visible.
 * @param {string} props.activeNavId - Id of the current page.
 * @param {(navId: string) => void} props.onNavigate
 */
export function Sidebar({ id, isOpen, activeNavId, onNavigate }) {
  const sidebarClassNames = [styles.sidebar, isOpen && styles.open].filter(Boolean).join(' ');

  return (
    <aside id={id} className={sidebarClassNames}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true" />
        <div>
          <p className={styles.appName}>{APP_NAME}</p>
          <p className={styles.tagline}>{APP_TAGLINE}</p>
        </div>
      </div>

      <nav aria-label="Main" className={styles.nav}>
        {NAV_GROUPS.map((group) => (
          <section
            key={group.label}
            className={styles.group}
            aria-labelledby={`nav-${group.label}`}
          >
            <h2 id={`nav-${group.label}`} className={styles.groupLabel}>
              {group.label}
            </h2>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeNavId}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
