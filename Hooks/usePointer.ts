import { useEffect, useRef } from 'react';
import { useResize } from './useResize';

export type PointerData = {
  isDown: boolean;
  clientX: number;
  clientY: number;
  normalX: number;
  normalY: number;
  deltaX: number;
  deltaY: number;
  travelX: number;
  travelY: number;
};

export type TravelVector = {
  x: number;
  y: number;
};

export const PointerDefaults: PointerData = {
  isDown: false,
  clientX: 0,
  clientY: 0,
  normalX: 0,
  normalY: 0,
  deltaX: 0,
  deltaY: 0,
  travelX: 0,
  travelY: 0,
};

/**
 * A custom hook which wraps mouse/touch position event registration
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * A handler can be passed to the hook and is invoked whenever pointer events fire.
 *
 * Also returns the reference to the pointer data. The reference can be used to
 * simply fetch the (non-reactive) pointer data without specifying a handler:
 * `const pointer = usePointer(isActive); // Useful in a useRAF() loop`
 *
 * @param isActive        Determines if pointer position should currently be tracked. For performance sake this should only be true when necessary (e.g. while intersecting viewport)
 * @param handler         Invoked on mouse/touch events, current PointerData is passed as an argument.
 * @param releaseHandler  Called when a drag gesture is released, delta vector passed as an argument.
 * @param deps            List of dependencies used within the handler.
 */
export function usePointer(
  isActive: boolean,
  handler?: (data: PointerData) => void,
  releaseHandler?: (data: TravelVector) => void,
  deps = [],
) {
  const pointerState = useRef({
    ...PointerDefaults,
  } as PointerData);

  const deltaState = useRef({
    prevClientX: 0,
    prevClientY: 0,
    originClientX: 0,
    originClientY: 0,
  });

  const viewportDimensions = useResize();

  useEffect(() => {
    // Don't register for node environments (e.g. Server-Side Rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const propagate = (clientX: number, clientY: number) => {
      const { viewportWidth, viewportHeight } = viewportDimensions.current;

      pointerState.current.clientX = clientX;
      pointerState.current.clientY = clientY;

      pointerState.current.normalX = clientX / viewportWidth;
      pointerState.current.normalY = clientY / viewportHeight;

      pointerState.current.deltaX = clientX - deltaState.current.prevClientX;
      pointerState.current.deltaY = clientY - deltaState.current.prevClientY;

      // Reset the delta values each frame so that they can be used in rAF loops
      window.requestAnimationFrame(() => {
        pointerState.current.deltaX = 0;
        pointerState.current.deltaY = 0;
      });

      pointerState.current.travelX = clientX - deltaState.current.originClientX;
      pointerState.current.travelY = clientY - deltaState.current.originClientY;

      if (handler) {
        handler(pointerState.current as PointerData);
      }

      deltaState.current.prevClientX = clientX;
      deltaState.current.prevClientY = clientY;
    };

    const down = (clientX: number, clientY: number) => {
      pointerState.current.isDown = true;
      deltaState.current.originClientX = clientX;
      deltaState.current.originClientY = clientY;

      propagate(clientX, clientY);
    };

    const move = (clientX: number, clientY: number) => {
      propagate(clientX, clientY);
    };

    const up = (clientX: number, clientY: number) => {
      pointerState.current.isDown = false;

      if (releaseHandler) {
        releaseHandler({
          x: pointerState.current.travelX,
          y: pointerState.current.travelY,
        } as TravelVector);
      }

      propagate(clientX, clientY);

      deltaState.current.originClientX = 0;
      deltaState.current.originClientY = 0;
    };

    const handleMouseDown = (e: MouseEvent) => {
      down(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      move(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      up(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      down(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      move(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      up(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    // const handleMouseLeave = () => {
    //   // When cursor leaves viewport, reset position to center of viewport
    //   up(
    //     viewportDimensions.current.viewportWidth / 2,
    //     viewportDimensions.current.viewportHeight / 2,
    //   );
    // };

    // Cleanup "down" state on deactivation
    if (!isActive && pointerState.current.isDown) {
      up(pointerState.current.clientX, pointerState.current.clientY);
    }

    if (isActive) {
      document.addEventListener('mousedown', handleMouseDown, false);
      document.addEventListener('mousemove', handleMouseMove, false);
      document.addEventListener('mouseup', handleMouseUp, false);
      document.addEventListener('touchstart', handleTouchStart, false);
      document.addEventListener('touchmove', handleTouchMove, false);
      document.addEventListener('touchend', handleTouchEnd, false);
      // document.addEventListener('mouseleave', handleMouseLeave, false);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, false);
      document.removeEventListener('mousemove', handleMouseMove, false);
      document.removeEventListener('mouseup', handleMouseUp, false);
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchmove', handleTouchMove, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
      // document.removeEventListener('mouseleave', handleMouseLeave, false);
    };
  }, [isActive, handler, ...deps]);

  return pointerState;
}
