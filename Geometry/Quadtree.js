const Rectangle = require( './Rectangle' )

const Quadtree = ( bounds, capacity = 10 ) => ({
  bounds,
  capacity,
  points: [],
  isDivided: false,
  subdivide() {
    const { x, y, width, height } = this.bounds

    this.nw = Quadtree( Rectangle( x, y, width / 2, height / 2 ), this.capacity )
    this.ne = Quadtree( Rectangle( x + width / 2, y, width / 2, height / 2 ), this.capacity )
    this.sw = Quadtree( Rectangle( x, y + height / 2, width / 2, height / 2 ), this.capacity )
    this.se = Quadtree( Rectangle( x + width / 2, y + height / 2, width / 2, height / 2 ), this.capacity )
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

      if ( this.nw.insert( point ) ) return true
      else if ( this.ne.insert( point ) ) return true
      else if ( this.sw.insert( point ) ) return true
      else if ( this.se.insert( point ) ) return true
    }
  },
  query( area, matched = [] ) {

    if ( !this.bounds.intersects( area ) ) return matched

    for ( let i = 0, len = this.points.length; i < len; i++ ) {
      const point = this.points[ i ]

      if ( area.contains( point ) ) {
        matched.push( point )
      }
    }

    if ( this.isDivided ) {
      this.nw.query( area, matched )
      this.ne.query( area, matched )
      this.sw.query( area, matched )
      this.se.query( area, matched )
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

    ctx.strokeStyle = 'red'
    ctx.strokeRect( this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height )
    for ( let i = 0, len = this.points.length; i < len; i++ ) {
      const point = this.points[ i ]
      ctx.fillStyle = 'blue'
      ctx.fillRect( point.x - 2, point.y - 2, 4, 4 )
    }
    if ( this.isDivided ) {
      this.nw.visualize( ctx )
      this.ne.visualize( ctx )
      this.sw.visualize( ctx )
      this.se.visualize( ctx )
    }

    ctx.restore()
  }
})

module.exports = Quadtree
