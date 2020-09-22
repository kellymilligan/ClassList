import { useEffect, useRef } from 'react';

type ViewportData = {
  viewportWidth: number;
  viewportHeight: number;
};

/**
 * A custom hook which wraps window resize event registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * A handler can be passed to the hook and is invoked whenever window 'resize' events are triggered.
 *
 * Also returns the reference to the viewport dimensions. The reference can be used to
 * simply fetch the (non-reactive) viewport dimensions without specifying a handler:
 * `const dimensions = useResize(); // Useful in a useRAF() loop`
 *
 * @param handler Called on every resize event, as well as once immediately
 * @param deps    List of dependencies used within the handler
 */
export function useResize(handler?: (data: ViewportData) => void, deps = []) {
  const dimensions = useRef<ViewportData>({
    viewportWidth: 0,
    viewportHeight: 0,
  });

  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      dimensions.current = { viewportWidth, viewportHeight };

      if (handler) {
        handler({ viewportWidth, viewportHeight });
      }
    };

    window.addEventListener('resize', handleResize, false);

    // Fire initial invocation
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, [handler, ...deps]);

  return dimensions;
}
