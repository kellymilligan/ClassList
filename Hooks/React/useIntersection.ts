import { useEffect, useRef, useState } from 'react';

type IntersectionObserverOptions = {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
};

const defaultOptions: IntersectionObserverOptions = {
  root: null,
  rootMargin: '0% 0% 0% 0%',
  threshold: 0,
};

/**
 * A custom hook which wraps IntersectionObserver registration.
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param handler Called when intersection changes, passed the intersection entry.
 * @param options IntersectionObserver options (root, rootMargin, threshold), see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * @param deps    List of dependencies used within the handler.
 */
export function useIntersection(handler: Function, options = {}, deps = []) {
  const [node, setNode] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (typeof window === 'undefined') {
      return;
    }

    // Clear if already observing
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new window.IntersectionObserver(
      ([entry]) => handler(entry),
      { ...defaultOptions, ...options },
    );

    const { current: currentObserver } = observer;

    if (node) currentObserver.observe(node);

    return () => currentObserver.disconnect();
  }, [node, options, ...deps]);

  return [setNode];
}
