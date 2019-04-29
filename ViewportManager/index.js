/*
  Establish the ViewportManager as a global singleton.

  The main instance can be imported as a standard module:
  import ViewportManager from 'utils/ViewportManager'

  Access to the underlying class is still available if needed:
  import { ViewportManager } from 'utils/ViewportManager'
*/

import ViewportManager from './ViewportManager'

const instance = new ViewportManager()

export { ViewportManager }
export default instance
