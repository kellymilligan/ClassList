/*
  Establish the InputManager as a global singleton.

  The main instance can be imported as a standard module:
  import input from 'path/to/InputManager'

  Access to the underlying class is still available if needed:
  import { InputManager } from 'path/to/InputManager'
*/

import InputManager from './InputManager'

const instance = new InputManager()

export { InputManager }
export default instance
