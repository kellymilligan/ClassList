/*

  IntersectionManager
  -
  A controller class which manages the intersection of
  bound items against the viewport.

*/

import { uuid } from '@/utils/unique_id'

class IntersectionManager {

  get defaultOptions() {
    return {
      threshold: 0.1 // 10% within viewport
    }
  }

  constructor() {

    this.stack = []
  }

  register( target, inHandler, outHandler = () => {}, options = {} ) {

    const id = uuid()
    const config = { ...this.defaultOptions, ...options }

    this.stack[ id ] = {
      config,
      target,
      observer: new IntersectionObserver( entries => {
        entries.forEach( entry => {
          // Note: top <= 0 can sometimes return inaccurately when threshold is `1`, i.e. fully in viewport
          const direction = entry.boundingClientRect.top <= 0 ? -1 : 1
          if ( entry.intersectionRatio > config.threshold ) inHandler( direction )
          else outHandler( direction )
        } )
      }, config )
    }

    this.stack[ id ].observer.observe( target )

    return id
  }

  deregister( id ) {

    this.stack[ id ].observer.unobserve( this.stack[ id ].target )

    delete this.stack[ id ]
  }

}

export default IntersectionManager
