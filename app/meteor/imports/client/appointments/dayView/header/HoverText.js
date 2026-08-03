import React, { useState } from 'react'

// Text that changes color on hover and while pressed (active) to signal that it
// is clickable. baseColor is optional – when omitted the normal (inherited)
// color is kept until hovered/pressed.
export const HoverText = ({ children, baseColor, hoverColor, activeColor, style, onMouseDown }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const color = active ? activeColor : (hover ? hoverColor : baseColor)

  return (
    <span
      style={{ ...style, ...(color ? { color } : {}), cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={(e) => { setActive(true); if (onMouseDown) { onMouseDown(e) } }}
      onMouseUp={() => setActive(false)}>
      {children}
    </span>
  )
}
