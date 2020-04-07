const Box = require( './Box' )

const Octree = ( bounds, capacity = 10 ) => ({
  bounds,
  capacity,
  points: [],
  isDivided: false,
  subdivide() {
    const { x, y, z, width, height, depth } = this.bounds

    // Assumes left-handed coordinate space for Z axis
    this.cell000 = Octree( Box( x, y, z, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell100 = Octree( Box( x + width / 2, y, z, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell010 = Octree( Box( x, y + height / 2, z, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell110 = Octree( Box( x + width / 2, y + height / 2, z, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell001 = Octree( Box( x, y, z + depth / 2, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell101 = Octree( Box( x + width / 2, y, z + depth / 2, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell011 = Octree( Box( x, y + height / 2, z + depth / 2, width / 2, height / 2, depth / 2 ), this.capacity )
    this.cell111 = Octree( Box( x + width / 2, y + height / 2, z + depth / 2, width / 2, height / 2, depth / 2 ), this.capacity )

    this.isDivided = true
  },
  insert( point ) {

    if ( !this.bounds.contains( point ) ) return false

    if ( this.points.length < this.capacity ) {
      this.points.push( point )
      return true
    }
    else {
      if ( !this.isDivided ) {
        this.subdivide()
      }

      if ( this.cell000.insert( point ) ) return true
      else if ( this.cell100.insert( point ) ) return true
      else if ( this.cell010.insert( point ) ) return true
      else if ( this.cell110.insert( point ) ) return true
      else if ( this.cell001.insert( point ) ) return true
      else if ( this.cell101.insert( point ) ) return true
      else if ( this.cell011.insert( point ) ) return true
      else if ( this.cell111.insert( point ) ) return true
    }
  },
  query( volume, matched = [] ) {
    if ( !this.bounds.intersects( volume ) ) return matched

    for ( let i = 0, len = this.points.length; i < len; i++ ) {
      const point = this.points[ i ]

      if ( volume.contains( point ) ) {
        matched.push( point )
      }
    }

    if ( this.isDivided ) {
      this.cell000.query( volume, matched )
      this.cell100.query( volume, matched )
      this.cell010.query( volume, matched )
      this.cell110.query( volume, matched )
      this.cell001.query( volume, matched )
      this.cell101.query( volume, matched )
      this.cell011.query( volume, matched )
      this.cell111.query( volume, matched )
    }

    return matched
  },
  getAllPoints() {

    return this.query( this.bounds, [] )
  },
  getRandomPoint() {

    const points = this.query( this.bounds, [] )
    return points[ Math.floor( Math.random() * points.length ) ]
  },
  // Visualize on a CanvasRenderingContext2D
  visualize( ctx ) {

    ctx.save()

    ctx.lineWidth = 6
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect( this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height )
    ctx.lineWidth = 2
    ctx.strokeStyle = '#00f'
    ctx.strokeRect( this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height )

    for ( let i = 0, len = this.points.length; i < len; i++ ) {
      const point = this.points[ i ]
      ctx.fillStyle = '#0f0'
      ctx.fillRect( point.x - 2, point.y - 2, 4, 4 )
    }

    if ( this.isDivided ) {
      this.cell000.visualize( ctx )
      this.cell100.visualize( ctx )
      this.cell010.visualize( ctx )
      this.cell110.visualize( ctx )
      this.cell001.visualize( ctx )
      this.cell101.visualize( ctx )
      this.cell011.visualize( ctx )
      this.cell111.visualize( ctx )
    }

    ctx.restore()
  }
})

module.exports = Octree
