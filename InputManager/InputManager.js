/*

  InputManager
  -
  A stand-alone controller class that handles user input.
  Internally manages event bindings and input dimensions.

*/

import ticker from '@/utils/TickManager'

export default class InputManager {

  get defaults() {
    return {

      isDown: false,
      isMoving: false,

      // Browser coordinates where top/left is 0/0, and bottom/right is w/h
      client: {
        x: 0,
        y: 0,
      },

      // Browser coordinates offset to place origin (0/0) at viewport center
      offset: {
        x: 0,
        y: 0,
      },

      // normal coordinates where top/left is 0/0, and bottom/right is 1/1
      // Can be used with an origin at the viewport center by multiplying by 2
      // and subtracting 1, giving a range from -1 to +1 on both axes.
      normal: {
        x: 0,
        y: 0,
      },

      // Distance travelled between current tick and when isDown was set
      travel: {
        startX: 0,
        startY: 0,
        x: 0,
        y: 0,
      },

      // Pointer delta parameters, calculated each tick
      speed: {
        x: 0,                 // Delta on x-axis
        y: 0,                 // Delta on y-axis
        distance: 0,          // Absolute delta
        prev: { x: 0, y: 0 }, // Previous X,Y normal position, used to calculate delta
      }

    }
  }

  // Return a static copy of the current tracking data
  get latest() { return { ...this.tracking } }

  // Return a prototypal copy of the tracking data object
  // The copy can have it's properties changed by the requester without affecting the Manager's state,
  // and continues to receive updated properties delegated from the Manager for un-changed properties.
  get subscribe() { return Object.create( this.tracking ) }

  get client() { return Object.create( this.tracking.data.client ) }
  get offset() { return Object.create( this.tracking.data.offset ) }
  get normal() { return Object.create( this.tracking.data.normal ) }
  get travel() { return Object.create( this.tracking.data.travel ) }
  get speed() { return Object.create( this.tracking.data.speed ) }

  constructor( element = document.body ) {

    this.element = element

    this.tracking = {
      active: false,
      touch: false,
      data: { ...this.defaults },
    }

    this.env = {
      time: {
        now: 0,
        delta: 0,
        prev: 0,
      },
      bounds: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      },
    }
  }

  // Public
  // ------

  /*
    Start tracking interactions
    Returns a subscription object to the tracking data
  */
  start( startingX = 0, startingY = 0 ) {

    if ( this.tracking.active ) { console.warn('InputManager: start() was called while already active...'); return this.tracking }

    this.tracking.active = true

    this.refresh()
    this.setPointer( startingX, startingY )
    this.setPointerSpeed()

    this.attachEvents()

    return this.subscribe
  }

  stop() {

    this.tracking.active = false
    this.tracking.data = { ...this.defaults }
    this.detachEvents()
  }

  /*
    Refresh tracking parameters (i.e. resize bounds with window resize)
    Dimensions can be overridden if passed as arguments
  */
  refresh(
    width = window.innerWidth,
    height = window.innerHeight,
    left = 0,
    top = 0
  ) {

    this.env.width = width
    this.env.height = height
    this.env.left = left
    this.env.top = top

    if ( width === 0 ) console.warn( 'InputManager.js: this.element\'s width is currently zero, this will break normal.x calculations due to division by zero.' )
    if ( height === 0 ) console.warn( 'InputManager.js: this.element\'s height is currently zero, this will break normal.y calculations due to division by zero.' )
  }

  // Bindings
  // --------

  attachEvents() {

    // Start animation loop
    this.tickID = ticker.on( () => this.onTick() )

    // Listen for the interaction initiatator on the element itself, but then
    // continue to track move and release events on the document. Allows the
    // interaction to continue updating, even if the pointer has left the area
    // of the tracked element.

    this.element.addEventListener( 'mousedown', this.onPointerDown, false )
    document.addEventListener( 'mousemove', this.onPointerMove, false )
    document.addEventListener( 'mouseup', this.onPointerUp, false )

    this.element.addEventListener( 'touchstart', this.onTouchStart, false )
    document.addEventListener( 'touchmove', this.onTouchMove, false )
    document.addEventListener( 'touchend', this.onTouchEnd, false )
  }

  detachEvents() {

    ticker.off( this.tickID )

    this.element.removeEventListener( 'mousedown', this.onPointerDown, false )
    document.removeEventListener( 'mousemove', this.onPointerMove, false )
    document.removeEventListener( 'mouseup', this.onPointerUp, false )

    this.element.removeEventListener( 'touchstart', this.onTouchStart, false )
    document.removeEventListener( 'touchmove', this.onTouchMove, false )
    document.removeEventListener( 'touchend', this.onTouchEnd, false )
  }

  // Helpers
  // -------

  setPointer(x, y) {

    this.tracking.data.client.x = x - this.env.left
    this.tracking.data.client.y = y - this.env.top
    this.tracking.data.offset.x = this.tracking.data.client.x - ( this.env.width * 0.5 )
    this.tracking.data.offset.y = this.tracking.data.client.y - ( this.env.height * 0.5 )
    this.tracking.data.normal.x = this.tracking.data.client.x / this.env.width
    this.tracking.data.normal.y = this.tracking.data.client.y / this.env.height
  }

  setPointerSpeed() {

    // Axis delta
    this.tracking.data.speed.x = this.tracking.data.normal.x - this.tracking.data.speed.prev.x
    this.tracking.data.speed.y = this.tracking.data.normal.y - this.tracking.data.speed.prev.y
    this.tracking.data.speed.prev.x = this.tracking.data.normal.x
    this.tracking.data.speed.prev.y = this.tracking.data.normal.y

    // Absolute delta
    this.tracking.data.speed.distance = Math.sqrt(
      ( this.tracking.data.speed.x * this.tracking.data.speed.x ) +
      ( this.tracking.data.speed.y * this.tracking.data.speed.y )
    )

    // Movement status
    this.tracking.data.isMoving = this.tracking.data.isDown && this.tracking.data.speed.distance > 0
  }

  // Handlers
  // --------

  onTick() {

    this.env.time.now = Date.now()
    this.env.time.delta = this.env.time.now - this.env.time.prev
    this.env.time.prev = this.env.time.now

    this.setPointerSpeed()
  }

  onPointerDown = ( e ) => {

    this.tracking.data.isDown = true

    this.setPointer( e.clientX, e.clientY )

    this.tracking.data.travel.startX = e.clientX
    this.tracking.data.travel.startY = e.clientY

    // Reset deltas
    this.tracking.data.travel.x = 0
    this.tracking.data.travel.y = 0
    this.tracking.data.speed.prev.x = this.tracking.data.normal.x
    this.tracking.data.speed.prev.y = this.tracking.data.normal.y
  }

  onPointerMove = ( e ) => {

    this.setPointer( e.clientX, e.clientY )

    if ( this.tracking.data.isDown ) {
      this.tracking.data.travel.x = e.clientX - this.tracking.data.travel.startX
      this.tracking.data.travel.y = e.clientY - this.tracking.data.travel.startY
    }
  }

  onPointerUp = ( e ) => {

    this.tracking.data.isDown = false

    this.setPointer( e.clientX, e.clientY )

    this.tracking.data.travel.startX = 0
    this.tracking.data.travel.startY = 0
    this.tracking.data.travel.x = 0
    this.tracking.data.travel.y = 0
  }

  // Relay to pointer handler
  onTouchStart = ( e ) => {

    this.tracking.touch = true

    e.clientX = e.touches[ 0 ].clientX
    e.clientY = e.touches[ 0 ].clientY
    this.onPointerDown( e )
  }

  // Relay to pointer handler
  onTouchMove = ( e ) => {

    e.clientX = e.touches[ 0 ].clientX
    e.clientY = e.touches[ 0 ].clientY
    this.onPointerMove( e )
  }

  // Relay to pointer handler
  onTouchEnd = ( e ) => {

    e.clientX = e.changedTouches[ 0 ].clientX
    e.clientY = e.changedTouches[ 0 ].clientY
    this.onPointerUp( e )
  }
}
