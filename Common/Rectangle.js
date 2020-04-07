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
  intersects( { x, y, width, height } ) {
    return !(
      x > this.x + this.width ||
      x + width < this.x ||
      y > this.y + this.height ||
      y + height < this.y
    )
  }
})

module.exports = Rectangle