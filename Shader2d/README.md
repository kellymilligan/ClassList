## A super duper simple, reusable, vanilla WebGL class for rendering a fragment shader. Useful for when all you want is to render your GLSL on-screen.

---

### TODO:
- Add support for texture (Sampler2D) uniforms

---

### Example Usage:

#### Init
```
this.shader = new Shader2d( document.getElementById( 'canvas' ), vertSource, fragSource, {
  u_yourUniform: {
    type: 'vec3',
    value: { x: 0, y: 0, z: 0 }
  }
} )
```

#### Resize
```
this.shader.resize( width, height )
```

#### Tick
```
this.shader.render( performance.now() )
```

#### Update
```
this.shader.updateUniforms( {
  u_mouse: { x: e.clientX, y: e.clientY }
} )
```
