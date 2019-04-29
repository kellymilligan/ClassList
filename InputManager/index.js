/*
  Establish the InputManager as a global singleton.

  The main instance can be imported as a standard module:
  import InputManager from 'utils/InputManager'

  Access to the underlying class is still available if needed:
  import { InputManager } from 'utils/InputManager'
*/

import InputManager from './InputManager'

const instance = new InputManager()

export { InputManager }
export default instance
