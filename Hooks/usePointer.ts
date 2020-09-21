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
 * @param active          Determines if pointer position should currently be tracked. For performance sake this should only be true when necessary (e.g. while intersecting viewport)
 * @param handler         Invoked on mouse/touch events, current PointerData is passed as an argument.
 * @param releaseHandler  Called when a drag gesture is released, delta vector passed as an argument.
 * @param deps            List of dependencies used within the handler.
 */
export function usePointer(
  active: boolean,
  handler: (data: PointerData) => void,
  releaseHandler?: (data: TravelVector) => void,
  deps = [],
) {
  const viewportDimensions = useRef({
    viewportWidth: 0,
    viewportHeight: 0,
  });

  const pointerState = useRef({
    ...PointerDefaults,
  });

  const deltaState = useRef({
    prevClientX: 0,
    prevClientY: 0,
    originClientX: 0,
    originClientY: 0,
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
    if (typeof window === 'undefined') {
      return;
    }

    const propagate = (clientX, clientY) => {
      const { viewportWidth, viewportHeight } = viewportDimensions.current;

      pointerState.current.clientX = clientX;
      pointerState.current.clientY = clientY;

      pointerState.current.normalX = clientX / viewportWidth;
      pointerState.current.normalY = clientY / viewportHeight;

      pointerState.current.deltaX = clientX - deltaState.current.prevClientX;
      pointerState.current.deltaY = clientY - deltaState.current.prevClientY;

      pointerState.current.travelX = clientX - deltaState.current.originClientX;
      pointerState.current.travelY = clientY - deltaState.current.originClientY;

      handler(pointerState.current as PointerData);

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
      deltaState.current.originClientX = 0;
      deltaState.current.originClientY = 0;

      if (releaseHandler) {
        releaseHandler({
          x: pointerState.current.travelX,
          y: pointerState.current.travelY,
        } as TravelVector);
      }

      propagate(clientX, clientY);
    };

    const onMouseDown = (e: MouseEvent) => {
      down(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      move(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      up(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      down(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      move(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      up(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    // const onMouseLeave = () => {
    //   // When cursor leaves viewport, reset position to center of viewport
    //   up(
    //     viewportDimensions.current.viewportWidth / 2,
    //     viewportDimensions.current.viewportHeight / 2,
    //   );
    // };

    if (active) {
      document.addEventListener('mousedown', onMouseDown, false);
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
      document.addEventListener('touchstart', onTouchStart, false);
      document.addEventListener('touchmove', onTouchMove, false);
      document.addEventListener('touchend', onTouchEnd, false);
      // document.addEventListener('mouseleave', onMouseLeave, false);
    }

    return () => {
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchstart', onTouchStart, false);
      document.removeEventListener('touchmove', onTouchMove, false);
      document.removeEventListener('touchend', onTouchEnd, false);
      // document.removeEventListener('mouseleave', onMouseLeave, false);
    };
  }, [active, handler, ...deps]);
}
