import { useEffect } from 'react';

/**
 * A custom hook which wraps window resize event registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param handler Called on every resize event, as well as once immediately
 * @param deps    List of dependencies used within the handler
 */
export function useResize(handler: Function, deps = []) {
  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const onResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      handler({ viewportWidth, viewportHeight });
    };

    window.addEventListener('resize', onResize, false);

    // Fire initial invocation
    onResize();

    return () => {
      window.removeEventListener('resize', onResize, false);
    };
  }, [handler, ...deps]);
}
