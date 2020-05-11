import { useLayoutEffect } from 'react';

/**
 * A custom hook which wraps requestAnimationFrame registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param handler Called on every tick
 * @param deps
 */
export default function useTicker(handler, deps = []) {
  useLayoutEffect(() => {
    // Don't register for node environments (i.e. server-side prerendering)
    if (typeof window === undefined) return;

    let raf;
    let time = {
      delta: 0,
      elapsed: performance.now(),
    };

    const onTick = () => {
      const elapsed = performance.now();
      const delta = elapsed - time.elapsed;
      time = { delta, elapsed };

      handler({ delta, elapsed });
      raf = window.requestAnimationFrame(onTick);
    };

    onTick();

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [handler, ...deps]);
}
