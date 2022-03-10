// Assumes left-handed coordinate space for Z axis

const Vector = require( './Vector' )

const Box = ( x = 0, y = 0, z = 0, width = 1, height = 1, depth = 1 ) => ({
  x,
  y,
  z,
  width,
  height,
  depth,
  contains( { x, y, z } ) {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height &&
      z >= this.z &&
      z < this.z + this.depth
    )
  },
  intersects( { x, y, z, width, height, depth, radius } ) {

    // Box
    if ( width !== undefined && height !== undefined && depth !== undefined ) {
      return !(
        x > this.x + this.width ||
        x + width < this.x ||
        y > this.y + this.height ||
        y + height < this.y ||
        z > this.z + this.depth ||
        z + depth < this.z
      )
    }
    // Sphere
    else if ( radius !== undefined ) {

      const centerDistance = Vector(
        Math.abs( ( this.x + this.width / 2 ) - x ),
        Math.abs( ( this.y + this.height / 2 ) - y ),
        Math.abs( ( this.z + this.depth / 2 ) - z )
      )

      if ( centerDistance.x > this.width / 2 + radius ) { return false }
      if ( centerDistance.y > this.height / 2 + radius ) { return false }
      if ( centerDistance.z > this.depth / 2 + radius ) { return false }

      if ( centerDistance.x <= this.width / 2 ) { return true }
      if ( centerDistance.y <= this.height / 2 ) { return true }
      if ( centerDistance.z <= this.depth / 2 ) { return true }

      return Math.pow( radius, 2 ) >= (
        Math.pow( centerDistance.x - this.width / 2, 2 ) +
        Math.pow( centerDistance.y - this.height / 2, 2 ) +
        Math.pow( centerDistance.z - this.depth / 2, 2 )
      )
    }

    return false
  }
})

module.exports = Box