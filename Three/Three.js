import { WebGLRenderer, Scene, PerspectiveCamera, Object3D, Vector3, Mesh, SphereGeometry, MeshNormalMaterial } from 'three'
import defaultsDeep from 'lodash.defaultsdeep'

import viewport from '@/utils/ViewportManager'
import { dataUrlToBlob } from '@/utils/canvas/'

export default class Three {

  get defaults() {
    return {
      append: true,
      antialias: true,
      container: document.body,
      width: window.innerWidth,
      height: window.innerHeight,
      clearColor: '#000',
      dprLimit: 2,
      camera: {
        fov: 75,
        far: 1000,
        position: new Vector3(0, 0, 100),
      }
    }
  }

  get asDataURL() {
    return this.renderer.domElement.toDataURL()
  }

  get asBlob() {
    return dataUrlToBlob( this.asDataURL )
  }

  constructor( config = {} ) {

    console.log('Three: instance created.')

    this.config = defaultsDeep( { ...config }, this.defaults )

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

    console.log('Three: instance destroyed.')
  }

  setupInstance() {

    const { append, antialias, container, width, height, clearColor, camera } = this.config

    // Renderer
    this.renderer = new WebGLRenderer( { antialias } )
    this.renderer.setSize( width, height )
    this.renderer.setClearColor( clearColor, 1 )

    // Scene
    this.scene = new Scene()
    this.origin = new Object3D()
    this.scene.add( this.origin )

    // Camera
    this.camera = new PerspectiveCamera( camera.fov, width / height, 1, camera.far )
    this.camera.position.copy( camera.position )

    append && container.appendChild( this.renderer.domElement )

    this.setupScene()

    this.resize()
    this.tick()
  }

  // Abstract
  setupScene() {

    this.origin.add( new Mesh( new SphereGeometry( 25 ), new MeshNormalMaterial( { wireframe: true } ) ) )
  }

  resize = () => {

    const { width, height, ratio, dpr } = viewport.latest

    this.camera.aspect = ratio
    this.camera.updateProjectionMatrix()

    this.renderer.setPixelRatio( Math.min( dpr, this.config.dprLimit ) )
    this.renderer.setSize( width, height )
  }

  tick = () => this.render()

  // Abstract
  render() {

    this.origin.rotation.y += 0.001 * Math.PI
    this.renderer.render( this.scene, this.camera )
  }

}
