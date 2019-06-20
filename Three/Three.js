import { WebGLRenderer, Scene, OrthographicCamera, PerspectiveCamera, Object3D, Vector3, Mesh, SphereGeometry, MeshNormalMaterial } from 'three'

import { dataUrlToBlob } from '@/utils/canvas/'

export default class Three {

  get defaults() {
    return {
      canvas: null,                       // Optionally pass a canvas element to initialize on
      appendTo: document.body,            // Only applicable if canvas is not defined
      antialias: true,                    // Apply default renderer antialiasing
      alpha: false,                       // Enable renderer alpha channel
      clearColor: '#000',                 // Colour of clear space
      clearAlpha: 1,                      // Opacity of clear space, only valid if alpha is enabled
      width: window.innerWidth,           // Width of canvas
      height: window.innerHeight,         // Height of canvas
      dprLimit: 2,                        // Maximum devicePixelRatio value
      orthographic: false,                // Render with an orthographic camera
      cameraFar: 1000,                    // Camera far plane Z pos
      cameraFov: 75,                      // Camera fov, Only applicable if orthographic is false
      cameraPos: new Vector3( 0, 0, 100 ) // Camera position, only applicable if orthographic is false
    }
  }

  get asDataURL() {
    return this.renderer.domElement.toDataURL()
  }

  get asBlob() {
    return dataUrlToBlob( this.asDataURL )
  }

  getOrthographicCamera( width, height, far ) {
    return new OrthographicCamera( width * -0.5, width * 0.5, height * 0.5, height * -0.5, -far, far )
  }

  getPerspectiveCamera( fov, width, height, far ) {
    return new PerspectiveCamera( fov, width / height, 1, far )
  }

  constructor( config = {} ) {

    this.config = Object.assign( {}, this.defaults, config )
    this.setupInstance()
  }

  // Abstract
  cleanup() { console.log( 'Three: cleanup() - call dispose() on THREE geometries, meshes and materials here.' ) }

  destroy() {

    this.cleanup()

    this.config = null
    this.renderer = null
    this.scene = null
    this.origin = null
    this.camera = null
  }


  setupInstance() {

    const { canvas, appendTo, antialias, alpha, clearColor, clearAlpha, width, height, orthographic, cameraFar, cameraFov, cameraPos } = this.config

    // Renderer
    this.renderer = new WebGLRenderer( { canvas, alpha, antialias } )
    this.renderer.setSize( width, height )
    this.renderer.setClearColor( clearColor, clearAlpha )

    // Scene
    this.scene = new Scene()
    this.origin = new Object3D()
    this.scene.add( this.origin )

    // Camera
    this.camera = orthographic
      ? this.getOrthographicCamera( width, height, cameraFar )
      : this.getPerspectiveCamera( cameraFov, width, height, cameraFar )

    this.camera.position.copy( cameraPos )

    if ( !canvas ) appendTo.appendChild( this.renderer.domElement )

    this.setupScene()

    this.resize( width, height, window.devicePixelRatio )
    this.tick()
  }

  // Abstract
  setupScene() {

    this.origin.add( new Mesh( new SphereGeometry( 25 ), new MeshNormalMaterial( { wireframe: true } ) ) )
  }

  resize = ( width = window.innerWidth, height = window.innerHeight, dpr = 1 ) => {

    this.config.width = width
    this.config.height = height

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setPixelRatio( Math.min( dpr, this.config.dprLimit ) )
    this.renderer.setSize( width, height )
  }

  tick = ( delta, elapsed ) => this.render( delta, elapsed )

  // Abstract
  render( delta, elapsed ) {

    this.origin.rotation.y += 0.001 * Math.PI
    this.renderer.render( this.scene, this.camera )
  }

}
