/*
  Establish the ViewportManager as a global singleton.

  The main instance can be imported as a standard module:
  import viewport from 'path/to/ViewportManager'

  Access to the underlying class is still available if needed:
  import { ViewportManager } from 'path/to/ViewportManager'
*/

import ViewportManager from './ViewportManager'

const instance = new ViewportManager()

export { ViewportManager }
export default instance
