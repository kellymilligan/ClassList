/*

  TickManager
  -
  A controller class which manages an Animation loop. It allows components to register
  to this overarching loop rather than binding their own on requestAnimationFrame.
  Assumes a browser environment and support for performance.now().

  Items can register with the tick loop using the register() or on() methods:
  const tickID = TickManager.on( ( delta, elapsed, stamp ) => {
    console.log( delta, elapsed, stamp )
  } )

  The ID returned from the registration should be used to de-register when needed:
  TickManager.off( tickID );

*/

// 128bit UUID - https://stackoverflow.com/a/44996682
function uuid() {
  const s4 = () => Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 )
  return `${ s4() + s4() }-${ s4() }-${ s4() }-${ s4() }-${ s4() + s4() + s4() }`
}

class TickManager {

  get defaults() {
    return {
      isRunning: false,
      time: {
        elapsed: 0,
        delta: 0,
        prev: 0,
        stamp: Date.now()
      }
    }
  }

  constructor( autostart = false ) {

    this.state = { ...this.defaults }
    this.stack = []

    autostart && this.start()
  }

  // Return a static copy of the current time data
  get time() { return { ...this.state.time } }


  // Public
  // ------

  start() {

    if ( this.state.isRunning ) { console.error('TickManager.js: instance was already running!'); return }

    this.state.isRunning = true

    this._addEvents()
  }

  stop() {

    this.state.isRunning = false

    this._removeEvents()
  }

  register( handler, ID ) {

    const id = ID !== undefined ? ID : uuid()

    this.stack[ id ] = handler

    return id
  }

  deregister( id ) {

    delete this.stack[ id ]
  }

  // Aliases
  on = handler => this.register( handler )
  off = id => this.deregister( id )


  // Private
  // -------

  _addEvents() {

    this.raf = window.requestAnimationFrame( this._onTick )
  }

  _removeEvents() {

    window.cancelAnimationFrame( this.raf )
  }

  _onTick = () => {

    this.raf = window.requestAnimationFrame( this._onTick )

    this._updateTime()
    this._propagate()
  }

  _updateTime() {

    const now = performance.now()

    this.state.time.elapsed = now
    this.state.time.delta = now - this.state.time.prev
    this.state.time.prev = now
    this.state.time.stamp = Date.now()
  }

  _propagate() {

    const { delta, elapsed, stamp } = this.state.time
    const keys = Object.keys( this.stack )

    for ( let i = 0, len = keys.length; i < len; i++ ) {
      this.stack[ keys[ i ] ]( delta, elapsed, stamp )
    }
  }

}

export default TickManager
