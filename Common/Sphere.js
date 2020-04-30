// Assumes left-handed coordinate space for Z axis

const distance3d = ( x1, y1, z1, x2, y2, z2 ) => (
  Math.sqrt( Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1, 2 ) + Math.pow( z2 - z1, 2 ) )
)

const Sphere = ( x = 0, y = 0, z = 0, radius = 1 ) => ({
  x,
  y,
  z,
  radius,
  contains( { x, y, z } ) {
    return distance3d( x, y, z, this.x, this.y, this.z ) <= this.radius
  },
  intersects( { x, y, z, radius, width, height, depth } ) {

    // Sphere
    if ( radius !== undefined ) {
      return distance3d( x, y, z, this.x, this.y, this.z ) < ( radius + this.radius )
    }
    // Box
    else if ( width !== undefined && height !== undefined && depth !== undefined ) {

      const centerDistance = Vector(
        Math.abs( this.x - ( x + width / 2 ) ),
        Math.abs( this.y - ( y + height / 2 ) ),
        Math.abs( this.z - ( z + depth / 2 ) ),
      )

      if ( centerDistance.x > width / 2 + this.radius ) { return false }
      if ( centerDistance.y > height / 2 + this.radius ) { return false }
      if ( centerDistance.z > depth / 2 + this.radius ) { return false }

      if ( centerDistance.x <= width / 2 ) { return true }
      if ( centerDistance.y <= height / 2 ) { return true }
      if ( centerDistance.z <= depth / 2 ) { return true }

      return Math.pow( this.radius, 2 ) >= (
        Math.pow( centerDistance.x - width / 2, 2 ) +
        Math.pow( centerDistance.y - height / 2, 2 ) +
        Math.pow( centerDistance.z - depth / 2, 2 )
      )
    }

    return false
  }
})

module.exports = Sphere