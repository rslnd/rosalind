import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import classnames from 'classnames'

// Minimal replacements for the react-bootstrap 0.32 components the app used.
// They render Bootstrap 3 markup to match client/css/vendor/bootstrap.css
// (react-bootstrap 1+ renders Bootstrap 4/5 markup, e.g. `.show` instead of `.in`).

const noop = () => {}

const sizeClass = (prefix, size) => ({
  large: `${prefix}-lg`,
  lg: `${prefix}-lg`,
  small: `${prefix}-sm`,
  sm: `${prefix}-sm`,
  xsmall: `${prefix}-xs`,
  xs: `${prefix}-xs`
})[size]

export const Button = ({ bsStyle = 'default', bsSize, active, block, className, type = 'button', ...props }) =>
  <button
    type={type}
    className={classnames(className, 'btn', `btn-${bsStyle}`, sizeClass('btn', bsSize), { active, 'btn-block': block })}
    {...props} />

export const ButtonGroup = ({ className, ...props }) =>
  <div role='group' className={classnames(className, 'btn-group')} {...props} />

// Open modals, topmost last. Only the topmost one reacts to Escape and enforces focus.
const openModals = []
let bodyPaddingRight = null

const lockBody = () => {
  const { body } = document
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  bodyPaddingRight = body.style.paddingRight
  if (scrollbarWidth > 0) {
    const padding = parseInt(window.getComputedStyle(body).paddingRight, 10) || 0
    body.style.paddingRight = `${padding + scrollbarWidth}px`
  }
  body.classList.add('modal-open')
}

const unlockBody = () => {
  document.body.classList.remove('modal-open')
  document.body.style.paddingRight = bodyPaddingRight
}

const ModalContext = createContext({ onHide: noop })

const OpenModal = ({
  onHide,
  bsSize,
  dialogClassName,
  className,
  style,
  backdropStyle,
  backdrop,
  keyboard,
  animation,
  enforceFocus,
  children
}) => {
  const id = useRef({})
  const dialogRef = useRef()
  const onHideRef = useRef(onHide)
  onHideRef.current = onHide
  const [entered, setEntered] = useState(!animation)

  useEffect(() => {
    if (openModals.length === 0) { lockBody() }
    openModals.push(id.current)
    const isTop = () => openModals[openModals.length - 1] === id.current

    const lastFocus = document.activeElement
    const dialog = dialogRef.current
    if (dialog && !dialog.contains(lastFocus)) { dialog.focus() }

    const handleKeyDown = e => {
      if (keyboard && e.key === 'Escape' && isTop()) { onHideRef.current() }
    }

    const handleFocus = () => {
      if (enforceFocus && isTop() && dialog && !dialog.contains(document.activeElement)) {
        dialog.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focus', handleFocus, true)

    // Fade in on the next frame so the transition from `.fade` to `.fade.in` runs
    const frame = animation && window.requestAnimationFrame(() => setEntered(true))

    return () => {
      if (frame) { window.cancelAnimationFrame(frame) }
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focus', handleFocus, true)
      openModals.splice(openModals.indexOf(id.current), 1)
      if (openModals.length === 0) { unlockBody() }
      if (lastFocus && lastFocus.focus) { lastFocus.focus() }
    }
  }, [])

  const handleDialogClick = e => {
    if (backdrop === true && e.target === e.currentTarget) { onHide() }
  }

  return createPortal(
    <div>
      {backdrop &&
        <div
          className={classnames('modal-backdrop', { fade: animation, in: entered })}
          style={backdropStyle} />}
      <div
        ref={dialogRef}
        tabIndex='-1'
        role='dialog'
        style={{ display: 'block', ...style }}
        className={classnames(className, 'modal', { fade: animation, in: entered })}
        onClick={handleDialogClick}>
        <div className={classnames(dialogClassName, 'modal-dialog', sizeClass('modal', bsSize))}>
          <div className='modal-content' role='document'>
            <ModalContext.Provider value={{ onHide }}>
              {children}
            </ModalContext.Provider>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export const Modal = ({
  show = false,
  onHide = noop,
  backdrop = true,
  keyboard = true,
  animation = true,
  enforceFocus = true,
  ...props
}) =>
  show
    ? <OpenModal
      onHide={onHide}
      backdrop={backdrop}
      keyboard={keyboard}
      animation={animation}
      enforceFocus={enforceFocus}
      {...props} />
    : null

const ModalHeader = ({ closeButton, className, children, ...props }) => {
  const { onHide } = useContext(ModalContext)
  return <div className={classnames(className, 'modal-header')} {...props}>
    {closeButton &&
      <button type='button' className='close' onClick={onHide}>
        <span aria-hidden='true'>&times;</span>
        <span className='sr-only'>Close</span>
      </button>}
    {children}
  </div>
}

const classed = (Tag, bsClass) => ({ className, ...props }) =>
  <Tag className={classnames(className, bsClass)} {...props} />

Modal.Header = ModalHeader
Modal.Title = classed('h4', 'modal-title')
Modal.Body = classed('div', 'modal-body')
Modal.Footer = classed('div', 'modal-footer')
