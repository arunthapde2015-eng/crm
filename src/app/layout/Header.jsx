import { Icon } from '@/components/Icon';
import { UNREAD_NOTIFICATION_COUNT } from '@/constants/session';
import { useAuth } from '@/context/AuthContext';

import { UserMenu } from './UserMenu';
import styles from './Header.module.css';

/**
 * Top bar: navigation toggle, global search, role, user menu and notifications.
 *
 * @param {object} props
 * @param {boolean} props.isNavOpen - Whether the sidebar is currently visible.
 * @param {string} props.navControlsId - Id of the sidebar element the toggle controls.
 * @param {() => void} props.onNavToggle
 * @param {(navId: string) => void} props.onNavigate
 */
export function Header({ isNavOpen, navControlsId, onNavToggle, onNavigate }) {
  const { currentUser, currentRole } = useAuth();
  const unreadNotificationCount = UNREAD_NOTIFICATION_COUNT;

  return (
    <header className={`${styles.header} print-hidden`}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={isNavOpen ? 'Hide navigation' : 'Show navigation'}
        aria-expanded={isNavOpen}
        aria-controls={navControlsId}
        onClick={onNavToggle}
      >
        <Icon name="menu" />
      </button>

      <div role="search" className={styles.search}>
        <label htmlFor="global-search" className="visually-hidden">
          Search
        </label>
        <Icon name="search" size={18} className={styles.searchIcon} />
        <input
          id="global-search"
          type="search"
          className={styles.searchInput}
          placeholder="Search name, mobile, GSTIN, invoice or lead number"
        />
      </div>

      <div className={styles.end}>
        <span className={styles.role}>{currentRole.name}</span>
        <UserMenu userName={currentUser.name} onNavigate={onNavigate} />
        <button
          type="button"
          className={`${styles.iconButton} ${styles.notifications}`}
          aria-label={`Notifications, ${unreadNotificationCount} unread`}
        >
          <Icon name="bell" />
          {unreadNotificationCount > 0 && (
            <span className={styles.notificationBadge} aria-hidden="true">
              {unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
