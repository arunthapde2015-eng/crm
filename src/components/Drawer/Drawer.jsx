import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './Drawer.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)];
}

/**
 * Modal side panel. Escape or a click on the backdrop closes it, Tab stays inside it, and focus
 * goes back to whatever opened it when it closes. Render it only while open.
 *
 * @param {object} props
 * @param {string} props.labelledBy - Id of the heading that names the panel.
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.children
 */
export function Drawer({ labelledBy, onClose, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    panelRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      // Keep keyboard focus inside the open panel.
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, []);

  // Rendered at the end of <body>, outside the app, so printing can show just this panel
  // (global print styles hide #root while a drawer layer is present).
  return createPortal(
    <div data-drawer-layer="">
      {/* Pointer-only shortcut; keyboard users close with Escape or the panel's close button. */}
      <button
        type="button"
        className={styles.backdrop}
        tabIndex={-1}
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
