/*

  ViewportManager
  -
  A self contained controller class which keeps track of window parameters.
  Can manage window event bindings internally or operate dependently.

  import viewport from 'ViewportManager'
  viewport.bind()

  Items can register to 'resize' or 'scroll' events using the register() or on() methods:

  const resizeID = ViewportManager.on( 'resize', ( { width, height } ) => {
    console.log( width )
  } )
  const scrollID = ViewportManager.on( 'scroll', ( { scroll, scrollTop, scrollHeight } ) => {
    console.log( scrollTop )
  } )

  The ID returned from the registration should be used to de-register when needed:

  ViewportManager.off( resizeID )
  ViewportManager.off( scrollID )

*/
import uuid from '../../utils/uuid.js'

export enum Type {
  RESIZE = 'resize',
  SCROLL = 'scroll',
}

export type ResizeHandler = (
  data: { width: number; height: number; dpr: number; scrollHeight: number },
  extended?: any
) => void

export type ScrollHandler = (
  data: { scroll: number; scrollTop: number; scrollLeft: number; scrollHeight: number },
  extended?: any
) => void

interface State {
  isBound: boolean
  width: number
  height: number
  ratio: number
  dpr: number
  scrollElement: HTMLElement | null
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scroll: number
}

interface Stack {
  [uuid: string]: {
    type: Type
    handler: ResizeHandler | ScrollHandler
  }
}

class ViewportManager {
  private _state: State = {
    isBound: false,
    width: typeof window === 'undefined' ? 1920 : window.innerWidth,
    height: typeof window === 'undefined' ? 1080 : window.innerHeight,
    ratio: 16 / 9,
    dpr: 1,
    scrollElement: null,
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scroll: 0,
  }
  private _stack: Stack = {}

  // Return a static copy of the current viewport data
  get latest() {
    return { ...this._state }
  }

  // Return a prototypal copy of the viewport state object.
  // The copy can have it's properties changed by the requester without affecting the Manager's state,
  // and continues to receive updated properties delegated from the Manager for un-changed properties.
  get subscribe() {
    return Object.create(this._state)
  }

  bind(scrollElement?: HTMLElement) {
    if (typeof window === 'undefined') {
      console.log('ViewportManager: no window object, ignoring...')
      return
    }

    if (this._state.isBound) {
      console.error('ViewportManager: instance was already bound!')
      return
    }

    if (scrollElement) {
      this._state.scrollElement = scrollElement
    }

    this._state.isBound = true
    this._attachEvents()
    this.refresh()
  }

  unbind() {
    if (typeof window === 'undefined') {
      console.log('ViewportManager: no window object, ignoring...')
      return
    }

    this._state.isBound = false
    this._detachEvents()
  }

  // Manually refresh environment
  refresh = () => {
    this._refreshResize()
    this._refreshScroll()
  }

  // Manually fire a handler propagation
  apply = () => {
    this._propagate(Type.RESIZE)
    this._propagate(Type.SCROLL)
  }

  resize = () => this._onResize()
  scroll = () => this._onScroll()

  register(type: Type, handler: ScrollHandler | ResizeHandler) {
    const id = uuid()

    this._stack[id] = { type, handler }

    return id
  }
  on = (type: Type, handler: ScrollHandler | ResizeHandler) =>
    this.register(type, handler)

  deregister(id: string) {
    delete this._stack[id]
  }
  off = (id: string) => this.deregister(id)

  private _attachEvents() {
    window.addEventListener('resize', this._onResize)

    if (this._state.scrollElement) {
      this._state.scrollElement.addEventListener( 'scroll', this._onScroll, { passive: true } )
    }
    else {
      window.addEventListener( 'scroll', this._onScroll, { passive: true } )
    }
  }

  private _detachEvents() {
    window.removeEventListener('resize', this._onResize)

    if (this._state.scrollElement) {
      this._state.scrollElement.removeEventListener('scroll', this._onScroll)
    }
    else {
      window.removeEventListener('scroll', this._onScroll)
    }
  }

  private _refreshResize() {
    if (typeof window === 'undefined') {
      return
    }

    const width = window.innerWidth
    const height = window.innerHeight

    this._state.width = width
    this._state.height = height
    this._state.ratio = width / height

    this._state.dpr = window.devicePixelRatio
    this._state.scrollHeight = Math.max(
      this._state.scrollElement
        ? this._state.scrollElement.scrollHeight
        : document.body.scrollHeight,
      height
    )
  }

  private _onResize = () => {
    this._refreshResize()
    this._propagate(Type.RESIZE)
  }

  private _refreshScroll() {
    if (typeof window === 'undefined') {
      return
    }

    this._state.scrollTop = this._state.scrollElement
      ? this._state.scrollElement.scrollTop
      : window.pageYOffset

    this._state.scrollLeft = this._state.scrollElement
      ? this._state.scrollElement.scrollLeft
      : window.pageXOffset

    this._state.scroll =
      this._state.scrollTop === 0 || this._state.scrollHeight <= this._state.height
        ? 0
        : Math.min(1, Math.max(0, this._state.scrollTop / (this._state.scrollHeight - this._state.height)))
  }

  private _onScroll = () => {
    this._refreshScroll()
    this._propagate(Type.SCROLL)
  }

  private _propagate(type: Type) {
    const { width, height, dpr, scroll, scrollTop, scrollLeft, scrollHeight } = this._state
    const keys = Object.keys(this._stack)

    for (let i = 0, len = keys.length; i < len; i++) {
      if (
        this._stack[keys[i]] !== undefined &&
        this._stack[keys[i]].type === type
      ) {
        if (type === Type.RESIZE) {
          (this._stack[keys[i]].handler as ResizeHandler)({
            width,
            height,
            dpr,
            scrollHeight,
          })
        } else if (type === Type.SCROLL) {
          (this._stack[keys[i]].handler as ScrollHandler)({
            scroll,
            scrollTop,
            scrollLeft,
            scrollHeight,
          })
        }
      }
    }
  }
}

export default ViewportManager
