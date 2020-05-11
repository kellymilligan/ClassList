import { useLayoutEffect, useRef } from 'react';
import useResize from '../hooks/useResize';

/**
 * A custom hook which wraps mouse/touch position even registration
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param handler Called on mouse/touch event, passing through pointer position data
 * @param deps
 */
export default function usePointer(handler, deps = []) {
  const viewportDimensions = useRef({
    viewportWidth: 0,
    viewportHeight: 0,
  });

  useResize(({ viewportWidth, viewportHeight }) => {
    viewportDimensions.current = {
      viewportWidth,
      viewportHeight,
    };
  });

  useLayoutEffect(() => {
    // Don't register for node environments (i.e. server-side prerendering)
    if (typeof window === undefined) return;

    const propagate = (clientX, clientY) => {
      const { viewportWidth, viewportHeight } = viewportDimensions.current;

      const normalX = clientX / viewportWidth;
      const normalY = clientY / viewportHeight;

      handler({
        clientX,
        clientY,
        normalX,
        normalY,
      });
    };

    const onPointerDown = e => {
      propagate(e.clientX, e.clientY);
    };

    const onPointerMove = e => {
      propagate(e.clientX, e.clientY);
    };

    const onPointerUp = e => {
      propagate(e.clientX, e.clientY);
    };

    // Relay to pointer handler
    const onTouchStart = e => {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
      onPointerDown(e);
    };

    // Relay to pointer handler
    const onTouchMove = e => {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
      onPointerMove(e);
    };

    // Relay to pointer handler
    const onTouchEnd = e => {
      e.clientX = e.changedTouches[0].clientX;
      e.clientY = e.changedTouches[0].clientY;
      onPointerUp(e);
    };

    const onMouseLeave = e => {
      const { viewportWidth, viewportHeight } = viewportDimensions.current;
      propagate(viewportWidth / 2, viewportHeight / 2);
    };

    document.addEventListener('mousedown', onPointerDown, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('touchstart', onTouchStart, false);
    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchend', onTouchEnd, false);

    document.addEventListener('mouseleave', onMouseLeave, false);

    return () => {
      document.removeEventListener('mousedown', onPointerDown, false);
      document.removeEventListener('mousemove', onPointerMove, false);
      document.removeEventListener('mouseup', onPointerUp, false);
      document.removeEventListener('touchstart', onTouchStart, false);
      document.removeEventListener('touchmove', onTouchMove, false);
      document.removeEventListener('touchend', onTouchEnd, false);

      document.removeEventListener('mouseleave', onMouseLeave, false);
    };
  }, [handler, ...deps]);
}
