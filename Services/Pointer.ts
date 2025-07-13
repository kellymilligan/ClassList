export type PointerData = {
	isDown: boolean;
	client: [number, number];
	normalized: [number, number];
	delta: [number, number];
	travel: [number, number];
};

export type PointerTravelVector = {
	x: number;
	y: number;
};

export const PointerDefaults: PointerData = {
	isDown: false,
	client: [0, 0],
	normalized: [0, 0],
	delta: [0, 0],
	travel: [0, 0]
};

/**
 * A custom object which wraps mouse/touch position event registration
 * This improves ergonomics and ensures cleanup is always handled appropriately.
 *
 * Handlers can be passed to the object and are invoked when pointer events fire or a gesture is released.
 *
 * @param moveHandler     Invoked when the pointer moves (fires regularly!), current PointerData is passed as an argument.
 * @param downHandler     Invoked when a gesture is initiated, current PointerData is passed as an argument.
 * @param dragHandler     Invoked when a gesture is moved/dragged, current PointerData and a travel vector is passed as an argument.
 * @param releaseHandler  Invoked when a gesture is released, a travel vector is passed as an argument and can be used to determine "clicks" from drag gestures.
 * @param viewportSize    Optional viewport size, if not provided will default to window.innerWidth and window.innerHeight in browser environments.
 * @returns methods for attaching and detaching the pointer from the document, resizing the pointer space, and also a reference to the pointer data object for use in animation loops.
 */
export const Pointer = (
	moveHandler?: (data: PointerData) => void,
	downHandler?: (data: PointerData) => void,
	dragHandler?: (data: PointerData, travel: PointerTravelVector) => void,
	releaseHandler?: (travel: PointerTravelVector) => void,
	viewportSize?: [number, number]
) => {
	const isBrowser = typeof window === 'undefined';

	const pointerState = {
		...PointerDefaults
	} as PointerData;

	const deltaState = {
		prevClientX: 0,
		prevClientY: 0,
		originClientX: 0,
		originClientY: 0
	};

	const viewportDimensions = [
		viewportSize ? viewportSize[0] : isBrowser ? window.innerWidth : 0,
		viewportSize ? viewportSize[1] : isBrowser ? window.innerHeight : 0
	];

	const propagate = (clientX: number, clientY: number) => {
		const [viewportWidth, viewportHeight] = viewportDimensions;

		pointerState.client = [clientX, clientY];

		pointerState.normalized = [clientX / viewportWidth, clientY / viewportHeight];

		pointerState.delta = [clientX - deltaState.prevClientX, clientY - deltaState.prevClientY];

		// Reset the delta values upon each frame so that they can be used within
		// requestAnimationFrame loops to approximate real-time pointer velocity
		if (isBrowser) {
			window.requestAnimationFrame(() => {
				pointerState.delta = [0, 0];
			});
		}

		pointerState.travel = [clientX - deltaState.originClientX, clientY - deltaState.originClientY];

		if (moveHandler) {
			moveHandler(pointerState as PointerData);
		}

		deltaState.prevClientX = clientX;
		deltaState.prevClientY = clientY;
	};

	const down = (clientX: number, clientY: number) => {
		pointerState.isDown = true;
		deltaState.originClientX = clientX;
		deltaState.originClientY = clientY;

		if (downHandler) {
			downHandler(pointerState as PointerData);
		}

		propagate(clientX, clientY);
	};

	const move = (clientX: number, clientY: number) => {
		propagate(clientX, clientY);

		if (dragHandler && pointerState.isDown) {
			dragHandler(
				pointerState as PointerData,
				{
					x: pointerState.travel[0],
					y: pointerState.travel[1]
				} as PointerTravelVector
			);
		}
	};

	const up = (clientX: number, clientY: number) => {
		pointerState.isDown = false;

		if (releaseHandler) {
			releaseHandler({
				x: pointerState.travel[0],
				y: pointerState.travel[1]
			} as PointerTravelVector);
		}

		propagate(clientX, clientY);

		deltaState.originClientX = 0;
		deltaState.originClientY = 0;
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

	const attach = () => {
		document.addEventListener('mousedown', handleMouseDown, false);
		document.addEventListener('mousemove', handleMouseMove, false);
		document.addEventListener('mouseup', handleMouseUp, false);
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener('touchmove', handleTouchMove, false);
		document.addEventListener('touchend', handleTouchEnd, false);
	};

	const detach = () => {
		// Cleanup "down" state on detach
		if (pointerState.isDown) {
			up(pointerState.client[0], pointerState.client[1]);
		}
		document.removeEventListener('mousedown', handleMouseDown, false);
		document.removeEventListener('mousemove', handleMouseMove, false);
		document.removeEventListener('mouseup', handleMouseUp, false);
		document.removeEventListener('touchstart', handleTouchStart, false);
		document.removeEventListener('touchmove', handleTouchMove, false);
		document.removeEventListener('touchend', handleTouchEnd, false);
	};

	const resize = ([viewportWidth, viewportHeight]: [number, number]) => {
		viewportDimensions[0] = viewportWidth;
		viewportDimensions[1] = viewportHeight;
	};

	return {
		attach,
		detach,
		resize,
		state: pointerState
	};
};
