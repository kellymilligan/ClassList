/*

  Ticker
  -
  A controller which manages an Animation loop. It allows components to register
  to this overarching loop rather than binding their own on requestAnimationFrame.
  Assumes a browser environment and support for performance.now().

  Items can register with the tick loop using the register(), on() or subscribe(), 
	methods. The de-registration method is returned and should be invoked to clean up.
  const unsubscribe = Ticker.subscribe(({delta, elapsed, stamp}) => {
		console.log( delta, elapsed, stamp )
  })
  
	// Later
  unsubscribe()
*/

// import Stats from "stats.js";

// 128bit UUID - https://stackoverflow.com/a/44996682
function uuid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}

const Ticker = () => {
  const state = {
    isRunning: false,
    time: {
      elapsed: 0,
      delta: 0,
      factor: 0,
      prev: 0,
      stamp: Date.now(),
    },
  };
  const stack = [];
  let raf = null;

  // const stats = env.dev && env.browser ? new Stats() : null;

  const _updateTime = () => {
    const now = performance.now();

    state.time.elapsed = now;
    state.time.delta = now - state.time.prev;
    state.time.prev = now;
    state.time.stamp = Date.now();
    state.time.factor = state.time.delta / (1000 / 60);
  };

  const _propagate = () => {
    // if (stats) stats.begin();

    const { delta, factor, elapsed, stamp } = state.time;
    const keys = Object.keys(stack);

    for (let i = 0, len = keys.length; i < len; i++) {
      stack[keys[i]]({ delta, factor, elapsed, stamp });
    }
    // if (stats) stats.end();
  };

  const _onTick = () => {
    raf = window.requestAnimationFrame(_onTick);

    _updateTime();
    _propagate();
  };

  const _attachEvents = () => {
    raf = window.requestAnimationFrame(_onTick);
  };

  const _detachEvents = () => {
    window.cancelAnimationFrame(raf);
  };

  const start = () => {
    if (state.isRunning) {
      console.error("Ticker.js: instance was already running!");
      return;
    }

    state.isRunning = true;

    _attachEvents();

    // if (stats) {
    //   document.body.appendChild(stats.dom);
    // }
  };

  const stop = () => {
    state.isRunning = false;
    _detachEvents();
  };

  const deregister = (id) => {
    delete stack[id];
  };

  const register = (handler) => {
    const id = uuid();
    stack[id] = handler;
    return () => deregister(id);
  };

  // Aliases
  const on = (handler) => register(handler);
  const subscribe = (handler) => register(handler);

  return {
    start,
    stop,
    register,
    deregister,
    on,
    subscribe,
  };
};

const instance = Ticker();
export default instance;
