/**
 * An ultra lightweight tween helper for interpolating a normalised progress
 * value over a duration. Exposes methods to start, stop, and tick forward
 * the tween progress.
 *
 * Optionally supply an easing function which returns a normalised alpha value.
 *
 * @param duration - The duration of the tween in milliseconds
 * @param ease - The ease function to use
 * @param tickHandler - Invoked on each tick of the tween with the current value and progress passed as arguments
 * @param completeHandler - Invoked upon completion of the tween
 * @returns An object with the following methods:
 * - `tick` - Update function to step forward the tween progress
 * - `start` - Starts the tween
 * - `stop` - Stops the tween
 */
export const Tween = (
	duration: number = 1000,
	ease: (alpha: number) => number = (alpha: number) => alpha,
	tickHandler?: (value: number, progress: number) => void,
	completeHandler?: () => void
) => {
	let isRunning = false;

	let progress = 0;
	let value = 0;

	let currentTime = 0;
	let startTime = 0;

	let delayTimer = 0;

	const start = (delay = 0) => {
		clearTimeout(delayTimer);
		delayTimer = setTimeout(() => {
			isRunning = true;
			startTime = performance.now();
			currentTime = startTime;
		}, delay);
	};

	const stop = () => {
		clearTimeout(delayTimer);
		isRunning = false;
	};

	const tick = () => {
		if (!isRunning) return;

		currentTime = performance.now();

		progress = Math.min((currentTime - startTime) / duration, 1);
		value = ease(progress);

		tickHandler?.(value, progress);

		// Check for completeness
		if (progress >= 1) {
			stop();
			completeHandler?.();
		}
	};

	return {
		tick,
		start,
		stop
	};
};
