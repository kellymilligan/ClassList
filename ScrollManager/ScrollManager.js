
/*

  ScrollManager
  -
  A self contained controller class which keeps track
  of window scroll parameters. Can manage window event
  bindings interanlly or operate dependantly.

*/

class ScrollManager {

  get defaults() {
    return {
      windowHeight: 0,
      scrollTop: 0,
      scrollHeight: 0,
      scroll: 0,
      wheel: {
        deltaX: 0,
        deltaY: 0,
        directionX: 0,
        directionY: 0
      }
    }
  }

  // Return a static copy of the current viewport data
  get latest() { return { ...this.state } }

  // Return a prototypal copy of the viewport state object.
  // The copy can have it's properties changed by the requester without affecting the Manager's state,
  // and continues to receive updated properties delegated from the Manager for un-changed properties.
  get subscribe() { return Object.create( this.state ) }

  constructor( autobind = true ) {

    this.state = { ...this.defaults }

    this.isBound = false
    autobind && this.bind()

    this.refresh()
  }

  // Public
  // ------

  bind() {

    if ( this.isBound ) { console.error('ScrollManager.js: instance was already bound!'); return }

    this.isBound = true
    this.addEvents()
  }

  unbind() {

    this.isBound = false
    this.removeEvents()
  }

  // Dependant update
  // (if not binding window events internally, update the Manager from outside)
  resize = () => this.onResize()
  scroll = () => this.onScroll()

  // Static update
  // (manaually request a viewport udpate from outside)
  refresh() {

    this.onResize()
    this.onScroll()
  }

  // Bindings
  // --------

  addEvents() {

    window.addEventListener( 'resize', this.onResize )
    window.addEventListener( 'scroll', this.onScroll )
    if ( 'onwheel' in document ) window.addEventListener( 'wheel', this.onWheel )
    if ( 'onmousewheel' in document ) window.addEventListener( 'mousewheel', this.onMouseWheel )
  }

  removeEvents() {

    window.removeEventListener( 'resize', this.onResize )
    window.removeEventListener( 'scroll', this.onScroll )
    if ( 'onwheel' in document ) window.removeEventListener( 'wheel', this.onWheel )
    if ( 'onmousewheel' in document ) window.removeEventListener( 'mousewheel', this.onMouseWheel )
  }

  // Handlers
  // --------

  onResize = e => {

    this.state.windowHeight = window.innerHeight
    this.state.scrollHeight = document.body.scrollHeight
  }

  onScroll = e => {

    this.state.scrollTop = window.pageYOffset || document.documentElement.scrollTop
    this.state.scroll = this.state.scrollHeight === this.state.windowHeight ? 0 : // Prevent division by zero when no scrollable height
                        this.state.scrollTop / ( this.state.scrollHeight - this.state.windowHeight )
  }

  onWheel = e => {

    // @TODO - Add checks and normalization between different browser/OS

    const deltaX = e.wheelDeltaX || e.deltaX * -1
    const deltaY = e.wheelDeltaY || e.deltaY * -1
    const directionX = deltaX === 0 ? 0 : deltaX > 0 ? 1 : -1
    const directionY = deltaY === 0 ? 0 : deltaY > 0 ? -1 : 1

    this.state.wheel = { deltaX, deltaY, directionX, directionY }

    window.requestAnimationFrame( () => {
      this.state.wheel = { deltaX: 0, deltaY: 0, directionX: 0, directionY: 0 }
    } )
  }

}

export default ScrollManager
