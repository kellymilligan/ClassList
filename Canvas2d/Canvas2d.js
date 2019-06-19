import viewport from '@/managers/ViewportManager'
import dataUrlToBlob from '@/utils/canvas/dataUrlToBlob'

export default class Canvas2d {

  get defaults() {
    return {
      canvas: null,               // Optionally pass a canvas element to initialize on
      append: true,               // Only applicable if canvas = null
      appendTo: document.body,    // Only applicable if canvas = null
      autosize: true,             // Apply dimensions in CSS on reszie
      width: window.innerWidth,   // Width of canvas
      height: window.innerHeight, // Height of canvas
      dprLimit: 2,                // Maximum devicePixelRatio value
    }
  }

  get asDataURL() {
    return this.config.canvas.toDataURL()
  }

  get asBlob() {
    return dataUrlToBlob( this.asDataURL )
  }

  constructor( config = {} ) {

    this.config = Object.assign( {}, this.defaults, config )

    this.time = {
      start: Date.now(),
      previous: Date.now(),
      current: Date.now(),
      delta: 0,
      elapsed: 0,
    }

    this.ctx = null

    this.setupInstance()
  }

  destroy() {

    this.config.append && this.config.appendTo.removeChild( this.config.canvas )

    this.config = null
    this.time = null
    this.ctx = null
  }

  setupInstance() {

    const { append, appendTo, width, height } = this.config

    if ( !this.config.canvas ) {

      this.config.canvas = document.createElement( 'canvas' )
      append && appendTo.appendChild( this.config.canvas )
    }
    else {

      this.config.append = false
    }

    this.ctx = this.config.canvas.getContext( '2d' )

    this.resize( width, height )
  }

  resize = ( width, height ) => {

    const { autosize, dprLimit } = this.config
    const { dpr } = viewport.latest
    const resolution = Math.max( Math.min( dpr, dprLimit ), 1 )

    this.ctx.canvas.width = width * resolution
    this.ctx.canvas.height = height * resolution

    if ( autosize ) {
      this.ctx.canvas.style.width = width + 'px'
      this.ctx.canvas.style.height = height + 'px'
    }

    this.ctx.scale( resolution, resolution )
  }

  tick = () => {

    const prev = this.time.current

    this.time.current = Date.now()
    this.time.delta = this.time.current - this.time.previous
    this.time.elapsed = this.time.current - this.time.start
    this.time.previous = prev

    this.draw( this.ctx, this.time.delta, this.time.elapsed )
  }

  // Abstract
  draw( ctx, delta, elapsed ) {}

}
