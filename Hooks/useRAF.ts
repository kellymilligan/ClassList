import { useEffect } from 'react';

export type TimeData = {
  delta: number;
  elapsed: number;
};

/**
 * A custom hook which wraps requestAnimationFrame registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param active  Determines if loop should currently be running. For performance sake this should only be true when necessary (e.g. while intersecting viewport).
 * @param handler Called on every tick, passed an object argument containing delta and elapsed time.
 * @param deps    List of dependencies used within the handler.
 */
export function useRAF(active: boolean, handler: Function, deps = []) {
  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (typeof window === 'undefined') {
      return;
    }

    let raf: number;
    let time: TimeData = {
      delta: 1000 / 60,
      elapsed: performance.now(),
    };

    const onTick = () => {
      const elapsed = performance.now();
      const delta = elapsed - time.elapsed;
      time = { delta, elapsed };

      handler(<TimeData>{ delta, elapsed });
      // @TODO - KM - This can be significantly optimized by subscribing all handlers to
      //              a centralized ticker. This currently causes all handlers to be
      //              encapsulated in a series of rAF callbacks.
      raf = window.requestAnimationFrame(onTick);
    };

    if (active) onTick();

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [active, handler, ...deps]);
}
