import React, { useState } from 'react'
import { background, primary, primaryActive } from '../layout/styles'

// A clickable label styled as a prominent outlined button so it clearly reads as
// clickable. Rendered as a span (not a MUI Button) so a click bubbles up to the
// surrounding InlineEdit to start editing. Blue outline by default, darker on
// hover, and filled (pressed look) while active.
const labelButtonBaseStyle = {
  display: 'inline-block',
  textTransform: 'none',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.4,
  border: '1px solid',
  borderRadius: 4,
  padding: '4px 12px',
  cursor: 'pointer',
  userSelect: 'none'
}

export const LabelButton = ({ children, style, onMouseDown }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const color = active ? '#fff' : (hover ? primaryActive : primary)
  const borderColor = active ? primaryActive : (hover ? primaryActive : primary)
  const backgroundColor = active ? primaryActive : background

  return (
    <span
      style={{ ...labelButtonBaseStyle, color, borderColor, backgroundColor, ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={(e) => { setActive(true); if (onMouseDown) { onMouseDown(e) } }}
      onMouseUp={() => setActive(false)}>
      {children}
    </span>
  )
}
