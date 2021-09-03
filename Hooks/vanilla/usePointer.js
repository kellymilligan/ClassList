const usePointer = (element = document.body) => {
  const data = {
    isDown: false,
    isMoving: false,

    // Pointer browser coordinates where top/left is 0/0, and bottom/right is w/h
    client: {
      x: 0,
      y: 0,
    },

    // Pointer browser coordinates offset to place origin (0/0) at viewport center
    offset: {
      x: 0,
      y: 0,
    },

    // Pointer normal coordinates where top/left is 0/0, and bottom/right is 1/1
    // This is commonly used used with an origin at the viewport center:
    // normal.[x|y] * 2 - 1, giving a range from -1 to +1 on both axes.
    normal: {
      x: 0,
      y: 0,
    },

    // Pointer distance travelled between current tick and when isDown was set
    travel: {
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
    },

    // Pointer delta parameters, calculated each tick
    speed: {
      x: 0, // Delta on x-axis
      y: 0, // Delta on y-axis
      distance: 0, // Absolute delta
      prev: { x: 0, y: 0 }, // Previous X,Y normal position, used to calculate delta
    },

    // Measured from element
    bounds: {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
    },
  };

  let tickId;

  const measure = () => {
    const { width, height, left, top } = element.getBoundingClientRect();

    data.bounds.width = width;
    data.bounds.height = height;
    data.bounds.left = left;
    data.bounds.top = top;

    if (width === 0)
      console.warn(
        "usePointer.js: element's width is currently zero, this will break normal.x calculations due to division by zero."
      );
    if (height === 0)
      console.warn(
        "usePointer.js: element's height is currently zero, this will break normal.y calculations due to division by zero."
      );
  };

  const updatePosition = (x, y) => {
    data.client.x = x - data.bounds.left;
    data.client.y = y - data.bounds.top;
    data.offset.x = data.client.x - data.bounds.width * 0.5;
    data.offset.y = data.client.y - data.bounds.height * 0.5;
    data.normal.x = data.client.x / data.bounds.width;
    data.normal.y = data.client.y / data.bounds.height;
  };

  const updateSpeed = () => {
    // Axis delta
    data.speed.x = data.normal.x - data.speed.prev.x;
    data.speed.y = data.normal.y - data.speed.prev.y;
    data.speed.prev.x = data.normal.x;
    data.speed.prev.y = data.normal.y;

    // Absolute delta
    data.speed.distance = Math.sqrt(
      data.speed.x * data.speed.x + data.speed.y * data.speed.y
    );

    // Movement status
    data.isMoving = data.isDown && data.speed.distance > 0;
  };

  const handleTick = () => {
    updateSpeed();

    tickId = window.requestAnimationFrame(handleTick);
  };

  const handlePointerDown = (e) => {
    data.isDown = true;

    updatePosition(e.clientX, e.clientY);

    data.travel.startX = e.clientX;
    data.travel.startY = e.clientY;

    // Reset deltas
    data.travel.x = 0;
    data.travel.y = 0;
    data.speed.prev.x = data.normal.x;
    data.speed.prev.y = data.normal.y;
  };

  const handlePointerMove = (e) => {
    updatePosition(e.clientX, e.clientY);

    if (data.isDown) {
      data.travel.x = e.clientX - data.travel.startX;
      data.travel.y = e.clientY - data.travel.startY;
    }
  };

  const handlePointerUp = (e) => {
    data.isDown = false;

    updatePosition(e.clientX, e.clientY);

    data.travel.startX = 0;
    data.travel.startY = 0;
    data.travel.x = 0;
    data.travel.y = 0;
  };

  // Relay to pointer handler
  const handleTouchStart = (e) => {
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
    handlePointerDown(e);
  };

  // Relay to pointer handler
  const handleTouchMove = (e) => {
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
    handlePointerMove(e);
  };

  // Relay to pointer handler
  const handleTouchEnd = (e) => {
    e.clientX = e.changedTouches[0].clientX;
    e.clientY = e.changedTouches[0].clientY;
    handlePointerUp(e);
  };

  const attachEvents = () => {
    element.addEventListener("mousedown", handlePointerDown, false);
    document.addEventListener("mousemove", handlePointerMove, false);
    document.addEventListener("mouseup", handlePointerUp, false);
    element.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);
    document.addEventListener("touchend", handleTouchEnd, false);

    tickId = window.requestAnimationFrame(handleTick);
  };

  const detachEvents = () => {
    element.removeEventListener("mousedown", handlePointerDown, false);
    document.removeEventListener("mousemove", handlePointerMove, false);
    document.removeEventListener("mouseup", handlePointerUp, false);
    element.removeEventListener("touchstart", handleTouchStart, false);
    document.removeEventListener("touchmove", handleTouchMove, false);
    document.removeEventListener("touchend", handleTouchEnd, false);

    window.cancelAnimationFrame(tickId);
  };

  const destroy = () => {
    detachEvents();
  };

  // Bind
  measure();
  attachEvents();

  return {
    data,
    pointer: data,
    destroy,
    destroyPointer: destroy,
  };
};

module.exports = usePointer;
