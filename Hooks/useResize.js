import { useLayoutEffect } from 'react';

/**
 * A custom hook which wraps window resize event registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param handler Called on every resize, as well as once immediately
 * @param deps
 */
export default function useResize(handler, deps = []) {
  useLayoutEffect(() => {
    // Don't register for node environments (i.e. server-side prerendering)
    if (typeof window === undefined) return;

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
