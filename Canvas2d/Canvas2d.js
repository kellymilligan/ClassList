export default class Canvas2d {

  get defaults() {
    return {
      canvas: null,               // Optionally pass a canvas element to initialize on
      append: true,               // Only applicable if canvas is not defined
      appendTo: document.body,    // Only applicable if canvas is not defined
      autosize: true,             // Apply dimensions in CSS on reszie
      width: window.innerWidth,   // Width of canvas
      height: window.innerHeight, // Height of canvas
      dprLimit: 2,                // Maximum devicePixelRatio value
    }
  }

  get asDataURL() {
    return this.config.canvas.toDataURL()
  }

  constructor( config = {} ) {

    this.config = Object.assign( {}, this.defaults, config )
    this.setupInstance()
  }

  destroy() {

    this.config.append && this.config.appendTo.removeChild( this.config.canvas )

    this.config = null
    this.ctx = null
  }

  setupInstance() {

    const { canvas, append, appendTo, width, height } = this.config

    if ( !canvas ) {

      this.config.canvas = document.createElement( 'canvas' )
      append && appendTo.appendChild( this.config.canvas )
    }
    else {

      this.config.append = false
    }

    this.ctx = this.config.canvas.getContext( '2d' )

    this.resize( width, height, window.devicePixelRatio )
  }

  resize = ( width = window.innerWidth, height = window.innerHeight, dpr = 1 ) => {

    const resolution = Math.min( dpr, this.config.dprLimit )

    this.config.width = width
    this.config.height = height

    this.ctx.canvas.width = width * resolution
    this.ctx.canvas.height = height * resolution

    if ( this.config.autosize ) {
      this.ctx.canvas.style.width = width + 'px'
      this.ctx.canvas.style.height = height + 'px'
    }

    this.ctx.scale( resolution, resolution )
  }

  tick = ( delta, elapsed ) => {

    this.draw( this.ctx, delta, elapsed )
  }

  // Abstract
  draw( ctx, delta, elapsed ) {}

}
