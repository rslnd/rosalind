import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'

// The body is globally zoomed (client/css/layout.css: body { zoom: 1.221 }).
// A popover portaled into the zoomed body has the offset computed by Popper
// multiplied by that factor, so it ends up misplaced. We counter the translate
// offset by 1/zoom so it sits correctly.
const BODY_ZOOM = 1.221

const correctPopperForZoom = (popperStyles) => {
  if (!popperStyles || typeof popperStyles.transform !== 'string') {
    return popperStyles
  }
  const transform = popperStyles.transform.replace(
    /translate(3d)?\(([^)]*)\)/,
    (match, is3d, args) => {
      const scaled = args.split(',').map(part => {
        const value = parseFloat(part)
        return Number.isNaN(value) ? part.trim() : `${value / BODY_ZOOM}px`
      })
      return `translate${is3d || ''}(${scaled.join(', ')})`
    }
  )
  return { ...popperStyles, transform }
}

const tooltipStyle = {
  maxWidth: 260,
  padding: '6px 10px',
  borderRadius: 4,
  backgroundColor: 'rgba(97, 97, 97, 0.95)',
  color: '#fff',
  fontSize: 12,
  lineHeight: 1.4,
  textAlign: 'left',
  whiteSpace: 'normal',
  pointerEvents: 'none'
}

// Instant, zoom-correct tooltip shown while hovering `children`. Unlike a
// portaled MUI Tooltip (which is offset by the body's zoom: 1.221), this
// portals to body and divides the Popper translate back out by the zoom, so it
// lands in the right spot and is not clipped by any ancestor (e.g. a Menu).
// Pass an empty/undefined `title` to keep children but show no tooltip.
export const HoverTooltip = ({ title, placement = 'bottom', children }) => {
  const [hover, setHover] = useState(false)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 6] } },
      { name: 'preventOverflow', options: { altAxis: true, padding: 8 } },
      { name: 'flip', options: {} }
    ]
  })

  return (
    <span
      ref={setReferenceElement}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {children}
      {
        hover && title && ReactDOM.createPortal(
          <div
            ref={setPopperElement}
            style={{ ...correctPopperForZoom(styles.popper), zIndex: 3000 }}
            {...attributes.popper}>
            <div style={tooltipStyle}>{title}</div>
          </div>,
          document.body
        )
      }
    </span>
  )
}
