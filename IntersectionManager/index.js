/*
  Establish the IntersectionManager as a global singleton.

  The main instance can be imported as a standard module:
  import IntersectionManager from 'utils/IntersectionManager'

  Access to the underlying class is still available if needed:
  import { IntersectionManager } from 'utils/IntersectionManager'
*/

import IntersectionManager from './IntersectionManager'

const instance = new IntersectionManager()

export { IntersectionManager }
export default instance
