/*
  Establish the ScrollManager as a global singleton.

  The main instance can be imported as a standard module:
  import ScrollManager from 'utils/ScrollManager'

  Access to the underlying class is still available if needed:
  import { ScrollManager } from 'utils/ScrollManager'
*/

import ScrollManager from './ScrollManager'

const instance = new ScrollManager( false ) // Don't autobind, instead managed by App.js

export { ScrollManager }
export default instance
