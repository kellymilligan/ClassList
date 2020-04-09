const Vector = require( './Vector' )

const Rectangle = ( x = 0, y = 0, width = 1, height = 1 ) => ({
  x,
  y,
  width,
  height,
  contains( { x, y } ) {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    )
  },
  intersects( { x, y, width, height, radius } ) {

    // Rectangle
    if ( width !== undefined && height !== undefined ) {
      return !(
        x > this.x + this.width ||
        x + width < this.x ||
        y > this.y + this.height ||
        y + height < this.y
      )
    }
    // Circle
    else if ( radius !== undefined ) {

      const centerDistance = Vector(
        Math.abs( ( this.x + this.width / 2 ) - x ),
        Math.abs( ( this.y + this.height / 2 ) - y ),
      )

      if ( centerDistance.x > this.width / 2 + radius ) { return false }
      if ( centerDistance.y > this.height / 2 + radius ) { return false }

      if ( centerDistance.x <= this.width / 2 ) { return true }
      if ( centerDistance.y <= this.height / 2 ) { return true }

      return Math.pow( radius, 2 ) >= (
        Math.pow( centerDistance.x - this.width / 2, 2 ) +
        Math.pow( centerDistance.y - this.height / 2, 2 )
      )
    }

    return false
  }
})

module.exports = Rectangle