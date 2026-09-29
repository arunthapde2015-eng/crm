import { useEffect, useState } from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';

const DESKTOP_QUERY = '(min-width: 64rem)';
const SIDEBAR_ID = 'app-sidebar';

/**
 * App shell: side navigation, top header and the main content area.
 * On desktop the sidebar is docked and can be collapsed; on small screens it is an overlay drawer.
 */
export function AppLayout({ activeNavId, onNavigate, children }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isDesktopNavCollapsed, setIsDesktopNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isNavOpen = isDesktop ? !isDesktopNavCollapsed : isMobileNavOpen;
  const isDrawerOpen = !isDesktop && isMobileNavOpen;

  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  function handleNavToggle() {
    if (isDesktop) setIsDesktopNavCollapsed((isCollapsed) => !isCollapsed);
    else setIsMobileNavOpen((isOpen) => !isOpen);
  }

  function handleNavigate(navId) {
    onNavigate(navId);
    setIsMobileNavOpen(false);
  }

  const contentClassNames = [styles.content, isDesktop && isNavOpen && styles.contentShifted]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.layout}>
      <Sidebar
        id={SIDEBAR_ID}
        isOpen={isNavOpen}
        activeNavId={activeNavId}
        onNavigate={handleNavigate}
      />
      {isDrawerOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      <div className={contentClassNames}>
        <Header
          isNavOpen={isNavOpen}
          navControlsId={SIDEBAR_ID}
          onNavToggle={handleNavToggle}
          onNavigate={handleNavigate}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
