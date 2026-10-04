import { useState } from 'react';

import logoUrl from '@/assets/logo.png';
import { APP_NAME, APP_TAGLINE } from '@/constants/session';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleNavGroups } from '@/utils/permissions';

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

/** An item that opens a sub-menu instead of a page. It starts open while one of its pages is. */
function NavParent({ item, activeNavId, onNavigate }) {
  const hasActiveChild = item.children.some((child) => child.id === activeNavId);
  // null until the user toggles it, so it follows the active page until then.
  const [isToggledOpen, setIsToggledOpen] = useState(null);
  const isOpen = isToggledOpen ?? hasActiveChild;
  const listId = `nav-children-${item.id}`;

  return (
    <li>
      <button
        type="button"
        className={styles.item}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsToggledOpen(!isOpen)}
      >
        <span>{item.label}</span>
        <span aria-hidden="true" className={isOpen ? styles.chevronOpen : styles.chevron}>
          ▸
        </span>
      </button>
      {isOpen && (
        <ul id={listId} className={styles.subList}>
          {item.children.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              isActive={child.id === activeNavId}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
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
  const sidebarClassNames = [styles.sidebar, isOpen && styles.open, 'print-hidden']
    .filter(Boolean)
    .join(' ');
  const { currentRole } = useAuth();
  const navGroups = getAccessibleNavGroups(currentRole);

  return (
    <aside id={id} className={sidebarClassNames}>
      <div className={styles.brand}>
        {/* Decorative: the app name right beside it already names the brand. */}
        <img src={logoUrl} alt="" className={styles.logo} width="48" height="48" />
        <div>
          <p className={styles.appName}>{APP_NAME}</p>
          <p className={styles.tagline}>{APP_TAGLINE}</p>
        </div>
      </div>

      <nav aria-label="Main" className={styles.nav}>
        {navGroups.map((group) => (
          <section
            key={group.label}
            className={styles.group}
            aria-labelledby={`nav-${group.label}`}
          >
            <h2 id={`nav-${group.label}`} className={styles.groupLabel}>
              {group.label}
            </h2>
            <ul className={styles.list}>
              {group.items.map((item) =>
                item.children ? (
                  <NavParent
                    key={item.id}
                    item={item}
                    activeNavId={activeNavId}
                    onNavigate={onNavigate}
                  />
                ) : (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeNavId}
                    onNavigate={onNavigate}
                  />
                ),
              )}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
