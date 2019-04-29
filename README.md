# classroom
Reusable classes for working with the browser and different canvas contexts

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
