import React, { useState } from 'react'
import { __ } from '../../i18n'

const dotStyle = {
  width: 30,
  height: 30,
  minWidth: 30,
  minHeight: 30,
  margin: 3,
  backgroundColor: '#f2f2f2',
  borderRadius: '100%'
}

export const Dot = ({ classes, canBan, banned, onClick }) => {
  const [hover, setHover] = useState(false)

  const style = {
    ...dotStyle,
    cursor: canBan ? 'pointer' : 'auto',
    border: canBan && hover && '1px dashed #ccc',
    backgroundColor: banned && 'black'
  }

  return <div
    onClick={canBan ? onClick : null}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={style}
    title={banned ? __('patients.banned') : (canBan ? __('patients.toggleBanned') : '')} />
}
