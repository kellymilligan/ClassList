# ClassList
Reusable classes and objects for working with the browser and different canvas contexts

---

## Managers

### InputManager
A stand-alone controller class that handles user input.

### IntersectionManager
A controller class which manages the intersection of bound items against the viewport.

### ScrollManager
*simplfied version of `ViewportManager`*, A self contained controller class which keeps track of window scroll parameters, including "wheel" events.

### TickManager
A controller class which manages a global Animation loop.

### ViewportManager
A self contained controller class which keeps track of window parameters.

---

## Canvas

### Canvas2d
Standardized setup class for working with the canvas 2d context, abstracting away some of the more annoying bits. Allows you to focus on the primary `draw()` call

### Three
Standardized setup class for working with THREE scenes. Provides abstraction for common setup steps, and provides hooks for different lifecycle stages of the class.

### Shader2d
A super duper simple, reusable, vanilla WebGL class for rendering a fragment shader. Useful for when all you want is to render your GLSL on-screen.


---

## Common

Building blocks for math, geometry, data and other common requirements

### Vector
Basic Vector object, exports as a factory function which determines the vector dimension based on attributes supplied

### Rectangle
Basic 2D Rectangle geometry object

### Box
Basic 3D Box geometry object

### Quadtree
Quadtree object for working with 2D spatial point querying

### Octree
Octree object for working with 3D spatial point querying

---

## Hooks

Custom React hooks for common uses

### useRaf 
wraps requestAnimationFrame registration

### useResize
wraps window resize event registration

### usePointer
wraps mouse/touch position even registration

---

## Other

### Tween
Minimal tween class for interpolating a normalised progress value over a duration.
