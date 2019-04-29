
/*

  ViewportManager
  -
  A self contained controller class which keeps track of window parameters.
  Can manage window event bindings interanlly or operate dependantly.

*/

class ViewportManager {

  get defaults() {
    return {
      width: 1920,
      height: 1080,
      ratio: 16 / 9,
      dpr: 1,
      scrollTop: 0,
      scrollHeight: 0,
      scroll: 0,
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

    if ( this.isBound ) { console.error('ViewportManager.js: instance was already bound!'); return }

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
  }

  removeEvents() {

    window.removeEventListener( 'resize', this.onResize )
    window.removeEventListener( 'scroll', this.onScroll )
  }

  // Handlers
  // --------

  onResize = () => {

    const width = window.innerWidth
    const height = window.innerHeight

    this.state.width = width
    this.state.height = height
    this.state.ratio = width / height

    this.state.dpr = window.devicePixelRatio
    this.state.scrollHeight = document.body.scrollHeight
  }

  onScroll = () => {

    this.state.scrollTop = window.pageYOffset
    this.state.scroll = this.state.scrollTop / ( this.state.scrollHeight - this.state.height )
  }

}

export default ViewportManager
