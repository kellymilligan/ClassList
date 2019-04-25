/*
  A super duper simple, reusable, vanilla WebGL class for rendering a fragment shader.
  Useful for when all you want is to render your GLSL on-screen.

  TODO:
  - Add support for texture inputs

  Example Usage:
  ---
  // Init
  this.shader = new Shader2d( this.$refs.canvas, vertSource, fragSource, {
    u_yourUniform: {
      type: 'vec3',
      value: { x: 0, y: 0, z: 0 }
    }
  } )

  // Resize
  this.shader.resize( width, height )

  // Tick
  this.shader.render( performance.now() )

  // Update
  this.shader.updateUniforms( {
    u_mouse: { x: e.clientX, y: e.clientY }
  } )

*/

const vertDefault = `
  attribute vec4 a_position;
  varying vec2 v_pos;

  void main() {
    gl_Position = a_position;
    v_pos = a_position.xy;
  }
`

const fragDefault = `
  precision mediump float;

  uniform float u_time;
  varying vec2 v_pos;

  void main() {
    gl_FragColor = vec4( sin( u_time * 0.001 ) * 0.5 + 0.5, v_pos.x * 0.5 + 0.5, v_pos.y * 0.5 + 0.5, 1.0 );
  }
`

function createShader( gl, type, source ) {

  const shader = gl.createShader( type )

  gl.shaderSource( shader, source )
  gl.compileShader( shader )

  if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
    return shader
  }
  else {
    console.log( `Shader error: Type - ${ type } \n --- \n`, gl.getShaderInfoLog( shader ) )
    gl.deleteShader(shader)
  }
}

function createProgram( gl, vert, frag ) {

  const program = gl.createProgram()

  gl.attachShader( program, vert )
  gl.attachShader( program, frag )
  gl.linkProgram( program )

  if ( gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
    return program
  }
  else {
    console.log( `Program error: \n --- \n`, gl.getProgramInfoLog( program ) )
    gl.deleteProgram( program )
  }
}

export default class Shader2d {

  constructor( canvas, vertSource = vertDefault, fragSource = fragDefault, uniforms = {} ) {

    const gl = this.gl = canvas.getContext( 'webgl' )

    // Create shaders
    const vertShader = createShader( gl, gl.VERTEX_SHADER, vertSource )
    const fragShader = createShader( gl, gl.FRAGMENT_SHADER, fragSource )

    // Create program
    const program = this.program = createProgram( gl, vertShader, fragShader )

    // Save position attribute location
    this.positionAttributeLocation = gl.getAttribLocation( program, 'a_position' )

    // Setup default uniforms
    this.uniforms = {
      u_time: {
        location: gl.getUniformLocation( program, 'u_time' ),
        value: 0,
        type: 'float'
      },
      u_resolution: {
        location: gl.getUniformLocation( program, 'u_resolution' ),
        value: { x: 0, y: 0 },
        type: 'vec2'
      }
    }

    // Add extra uniforms
    Object.keys( uniforms ).forEach( name => {
      this.uniforms[ name ] = Object.assign( {}, uniforms[ name ], { location: gl.getUniformLocation( program, name ) } )
    } )

    // Create buffer and add full-screen rendering triangle
    this.positionBuffer = gl.createBuffer()

    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer )

    const positions = [
      -1.0, -1.0,
      -1.0, 3.0,
      3.0, -1.0,
    ]

    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW )

    this.resize()
    this.render()
  }

  resize( width = window.innerWidth, height = window.innerHeight ) {

    this.gl.canvas.width = width
    this.gl.canvas.height = height

    this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height )

    this.updateUniforms( { u_resolution: { x: width, y: height } } )
  }

  updateUniforms( uniforms ) {

    Object.keys( uniforms ).forEach( name => {
      this.uniforms[ name ].value = uniforms[ name ]
    } )
  }

  render( time ) {

    const { gl } = this

    // Update time uniform
    this.updateUniforms( { u_time: time } )

    // Clear the canvas
    gl.clearColor( 0, 0, 0, 0 )
    gl.clear( gl.COLOR_BUFFER_BIT )

    // Tell it to use our program (pair of shaders)
    gl.useProgram( this.program )

    // Bind the position attribute
    gl.enableVertexAttribArray( this.positionAttributeLocation )
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer )
    gl.vertexAttribPointer( this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0 )

    // Update uniforms
    Object.keys( this.uniforms ).forEach( name => {
      const uniform = this.uniforms[ name ]
      if ( uniform.type === 'vec4' ) gl.uniform4f( uniform.location, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w )
      else if ( uniform.type === 'vec3' ) gl.uniform3f( uniform.location, uniform.value.x, uniform.value.y, uniform.value.z )
      else if ( uniform.type === 'vec2' ) gl.uniform2f( uniform.location, uniform.value.x, uniform.value.y )
      else gl.uniform1f( uniform.location, uniform.value )
    } )

    // Draw
    const primitiveType = gl.TRIANGLES
    const pointOffset = 0
    const pointCount = 3
    gl.drawArrays( primitiveType, pointOffset, pointCount )

  }

}
