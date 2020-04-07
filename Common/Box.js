// Assumes left-handed coordinate space for Z axis

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
  intersects( { x, y, z, width, height, depth } ) {
    return !(
      x > this.x + this.width ||
      x + width < this.x ||
      y > this.y + this.height ||
      y + height < this.y ||
      z > this.z + this.depth ||
      z + depth < this.z
    )
  }
})

module.exports = Box