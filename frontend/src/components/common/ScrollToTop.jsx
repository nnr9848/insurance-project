import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Industry Standard Route Scroll Restoration
 * Ensures every page transition resets scroll position to the top of viewport.
 * If a hash anchor is present (e.g. #faq), smoothly scrolls to the target anchor.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow DOM to settle before querying anchor
      const timeoutId = setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }

    // Instant top scroll on standard page transitions
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}
