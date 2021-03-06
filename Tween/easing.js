/*
    Penner's easing equations adapted to accept a single normalized alpha value
    ---
    a          Number      normalized 'alpha' value (from 0-1)
    ---
    Returns    Number      alpha value with easing applied
*/

// Linear
// ------

export function linear ( a ) {

  return a
}

// Sine
// ----

export function easeInSine ( a ) {

  return -1 * Math.cos( a * ( Math.PI / 2 ) ) + 1
}

export function easeOutSine ( a ) {

  return 1 * Math.sin( a * ( Math.PI / 2 ) )
}

export function easeInOutSine ( a ) {

  return -0.5 * ( Math.cos( Math.PI * a / 1 ) - 1 )
}

// Quad
// ----

export function easeInQuad ( a ) {

  return a * a
}

export function easeOutQuad ( a ) {

  return -1 * a * ( a - 2 )
}

export function easeInOutQuad ( a ) {

  a /= 0.5
  if ( a < 1 ) return 0.5 * a * a
  a--
  return -0.5 * ( a * ( a - 2 ) - 1 )
}

// Cubic
// -----

export function easeInCubic ( a ) {

  return a * a * a
}

export function easeOutCubic ( a ) {

  a--
  return ( a * a * a + 1 )
}

export function easeInOutCubic ( a ) {

  a /= 0.5
  if ( a < 1 ) return 0.5 * a * a * a
  a -= 2
  return 0.5 * ( a * a * a + 2 )
}

// Quart
// -----

export function easeInQuart ( a ) {

  return a * a * a * a
}

export function easeOutQuart ( a ) {

  a--
  return -1 * ( a * a * a * a - 1 )
}

export function easeInOutQuart ( a ) {

  a /= 0.5
  if ( a < 1 ) return 0.5 * a * a * a * a
  a -= 2
  return -0.5 * ( a * a * a * a - 2 )
}

// Quint
// -----

export function easeInQuint ( a ) {

  return a * a * a * a * a
}

export function easeOutQuint ( a ) {

  a--
  return a * a * a * a * a + 1
}

export function easeInOutQuint ( a ) {

  a /= 0.5
  if ( a < 1 ) return 0.5 * a * a * a * a * a
  a -= 2
  return 0.5 * ( a * a * a * a * a + 2 )
}

// Expo
// ----

export function easeInExpo ( a ) {

  return Math.pow( 2, 10 * ( a - 1 ) )
}

export function easeOutExpo ( a ) {

  return -Math.pow( 2, -10 * a ) + 1
}

export function easeInOutExpo  ( a ) {

  a /= 0.5
  if ( a < 1 ) return 0.5 * Math.pow( 2, 10 * ( a - 1 ) )
  a--
  return 0.5 * ( -Math.pow( 2, -10 * a ) + 2 )
}
