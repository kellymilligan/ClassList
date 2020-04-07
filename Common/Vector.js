const Vector2 = (
  x = 0,
  y = 0
) => ({
  x,
  y
})

const Vector3 = (
  x = 0,
  y = 0,
  z = 0
) => ({
  x,
  y,
  z
})

const Vector4 = (
  x = 0,
  y = 0,
  z = 0,
  w = 0
) => ({
  x,
  y,
  z,
  w
})

module.exports = ( x, y, z, w ) => {
  if ( w !== undefined ) return Vector4( x, y, z, w )
  if ( z !== undefined ) return Vector3( x, y, z )
  return Vector2( x, y )
}