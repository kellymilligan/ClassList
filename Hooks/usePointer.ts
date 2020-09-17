import { useEffect, useRef } from 'react';
import { isServerSide } from '~/src/util';
import { useResize } from './useResize';

export type PointerData = {
  clientX: number;
  clientY: number;
  normalX: number;
  normalY: number;
};

export const PointerDefaults: PointerData = {
  clientX: 0,
  clientY: 0,
  normalX: 0.5,
  normalY: 0.5,
};

/**
 * A custom hook which wraps mouse/touch position event registration
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * @param active  Determines if pointer position should currently be tracked. For performance sake this should only be true when necessary (e.g. while intersecting viewport)
 * @param handler Called on mouse/touch events, passing through pointer position data.
 * @param deps    List of dependencies used within the handler.
 */
export function usePointer(active: boolean, handler: Function, deps = []) {
  const viewportDimensions = useRef({
    viewportWidth: 0,
    viewportHeight: 0,
  });

  useResize(
    ({ viewportWidth, viewportHeight }) => {
      viewportDimensions.current = {
        viewportWidth,
        viewportHeight,
      };
    },
    [active],
  );

  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (isServerSide) {
      return;
    }

    const propagate = (clientX = 0, clientY = 0) => {
      const { viewportWidth, viewportHeight } = viewportDimensions.current;

      const normalX = clientX / viewportWidth;
      const normalY = clientY / viewportHeight;

      handler(<PointerData>{
        ...PointerDefaults,
        clientX,
        clientY,
        normalX,
        normalY,
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      propagate(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      propagate(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      propagate(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      propagate(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      propagate(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      propagate(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    const onMouseLeave = () => {
      // When cursor leaves viewport, reset position to center of viewport
      propagate(
        viewportDimensions.current.viewportWidth / 2,
        viewportDimensions.current.viewportHeight / 2,
      );
    };

    if (active) {
      document.addEventListener('mousedown', onMouseDown, false);
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
      document.addEventListener('touchstart', onTouchStart, false);
      document.addEventListener('touchmove', onTouchMove, false);
      document.addEventListener('touchend', onTouchEnd, false);
      document.addEventListener('mouseleave', onMouseLeave, false);
    }

    return () => {
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchstart', onTouchStart, false);
      document.removeEventListener('touchmove', onTouchMove, false);
      document.removeEventListener('touchend', onTouchEnd, false);
      document.removeEventListener('mouseleave', onMouseLeave, false);
    };
  }, [active, handler, ...deps]);
}
