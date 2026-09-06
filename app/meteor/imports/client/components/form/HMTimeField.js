import React from 'react'
import TextField from '@material-ui/core/TextField'

// A small hour:minute time input, backed by an { h, m } value (HM schema).
// Renders a native time input so users get hour/minute fields with a picker.
const toString = hm => {
  if (!hm || typeof hm.h !== 'number') { return '' }
  const pad = n => String(n).padStart(2, '0')
  return `${pad(hm.h)}:${pad(hm.m || 0)}`
}

const fromString = s => {
  if (!s) { return null }
  const [h, m] = s.split(':')
  return {
    h: h ? parseInt(h, 10) : 0,
    m: m ? parseInt(m, 10) : 0
  }
}

export const HMTimeField = ({ value, onChange, label, disabled, style }) => (
  <TextField
    type='time'
    label={label}
    value={toString(value)}
    disabled={disabled}
    onChange={e => onChange(fromString(e.target.value))}
    InputLabelProps={{ shrink: true }}
    inputProps={{ step: 300 }}
    style={{ width: 110, ...style }}
  />
)
