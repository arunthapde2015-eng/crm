import { useCallback, useSyncExternalStore } from 'react';

function getMediaQueryList(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(query);
}

/**
 * Tracks whether a CSS media query currently matches.
 * Returns false where `matchMedia` is unavailable (SSR, jsdom).
 *
 * @param {string} query - e.g. '(min-width: 64rem)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mediaQueryList = getMediaQueryList(query);
      mediaQueryList?.addEventListener('change', onChange);
      return () => mediaQueryList?.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = () => getMediaQueryList(query)?.matches ?? false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
