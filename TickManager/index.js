/*
  Establish the TickManager as a global singleton.

  The main instance can be imported as a standard module:
  import TickManager from 'utils/TickManager'

  Access to the underlying class is still available if needed:
  import { TickManager } from 'utils/TickManager'
*/

import TickManager from './TickManager'

const instance = new TickManager()

export { TickManager }
export default instance
