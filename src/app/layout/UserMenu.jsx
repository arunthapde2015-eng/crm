import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/Icon';
import { NAV_IDS } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { canAccessNav } from '@/utils/permissions';

import styles from './UserMenu.module.css';

const MENU_ID = 'user-menu';
const MENU_LINKS = [
  { navId: NAV_IDS.MY_HR, label: 'My HR' },
  { navId: NAV_IDS.SETTINGS, label: 'Settings' },
];

/**
 * Signed-in user's name with a disclosure menu of account shortcuts and Sign out.
 *
 * @param {object} props
 * @param {string} props.userName
 * @param {(navId: string) => void} props.onNavigate
 */
export function UserMenu({ userName, onNavigate }) {
  const { currentRole, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const links = MENU_LINKS.filter((link) => canAccessNav(currentRole, link.navId));
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function handleLinkClick(navId) {
    onNavigate(navId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.name}>{userName}</span>
        <Icon name="chevronDown" size={16} />
      </button>
      {isOpen && (
        <ul id={MENU_ID} aria-label="Account" className={styles.menu}>
          {links.map((link) => (
            <li key={link.navId}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleLinkClick(link.navId)}
              >
                {link.label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={styles.menuItem} onClick={() => signOut()}>
              Sign out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
