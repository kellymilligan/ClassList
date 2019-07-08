
/*

  ViewportManager
  -
  A self contained controller class which keeps track of window parameters.
  Can manage window event bindings internally or operate dependently.

  Items can register to 'resize' or 'scroll' events using the register() or on() methods:
  const resizeID = ViewportManager.on( 'resize', ( width, height ) => {
    console.log( widthHeight )
  } )
  const scrollID = ViewportManager.on( 'scroll', ( scroll, scrollTop, scrollHeight ) => {
    console.log( scroll, scrollTop, scrollHeight )
  } )

  The ID returned from the registration should be used to de-register when needed:
  ViewportManager.off( resizeID );
  ViewportManager.off( scrollID );

*/

// 128bit UUID - https://stackoverflow.com/a/44996682
function uuid() {
  const s4 = () => Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 )
  return `${ s4() + s4() }-${ s4() }-${ s4() }-${ s4() }-${ s4() + s4() + s4() }`
}

class ViewportManager {

  get defaults() {
    return {
      isBound: false,
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

  constructor( autobind = false ) {

    this.state = { ...this.defaults }
    this.stack = []

    autobind && this.bind()

    this.refresh()
  }


  // Public
  // ------

  bind() {

    if ( this.state.isBound ) {
      console.error( 'ViewportManager.js: instance was already bound!' )
      return
    }

    this.state.isBound = true
    this._addEvents()
  }

  unbind() {

    this.state.isBound = false
    this._removeEvents()
  }

  refresh = () => {
    this._onResize()
    this._onScroll()
  }

  resize = () => this._onResize() // Manual update
  scroll = () => this._onScroll() // Manual update

  register( type = 'resize', handler, ID ) {

    const id = ID !== undefined ? ID : uuid()

    if ( type !== 'resize' && type !== 'scroll' ) {
      console.error( `ViewportManager.js: invalid event registration of type "${ type }"! Must be either 'resize' or 'scroll'.` )
      return
    }

    this.stack[ id ] = { type, handler }

    return id
  }

  deregister( id ) {

    delete this.stack[ id ]
  }

  // Aliases
  on = ( type, handler ) => this.register( type, handler )
  off = id => this.deregister( id )


  // Private
  // --------

  _addEvents() {

    window.addEventListener( 'resize', this._onResize )
    window.addEventListener( 'scroll', this._onScroll )
  }

  _removeEvents() {

    window.removeEventListener( 'resize', this._onResize )
    window.removeEventListener( 'scroll', this._onScroll )
  }

  _onResize = () => {

    const width = window.innerWidth
    const height = window.innerHeight

    this.state.width = width
    this.state.height = height
    this.state.ratio = width / height

    this.state.dpr = window.devicePixelRatio
    this.state.scrollHeight = document.body.scrollHeight

    this._propagate( 'resize' )
  }

  _onScroll = () => {

    this.state.scrollTop = window.pageYOffset
    this.state.scroll = this.state.scrollTop === 0 ? 0 : this.state.scrollTop / ( this.state.scrollHeight - this.state.height )

    this._propagate( 'scroll' )
  }

  _propagate( type ) {

    const { width, height, scroll, scrollTop, scrollHeight } = this.state
    const keys = Object.keys( this.stack )

    for ( let i = 0, len = keys.length; i < len; i++ ) {
      if ( this.stack[ keys[ i ] ][ 'type' ] === type ) {
        type === 'resize' && this.stack[ keys[ i ] ][ 'handler' ]( width, height )
        type === 'scroll' && this.stack[ keys[ i ] ][ 'handler' ]( scroll, scrollTop, scrollHeight )
      }
    }
  }

}

export default ViewportManager
