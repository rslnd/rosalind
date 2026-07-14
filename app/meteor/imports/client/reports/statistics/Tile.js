import React from 'react'

const tileStyle = {
  border: '1px solid #eee',
  borderRadius: 3,
  padding: '10px 14px',
  minWidth: 140,
  flex: '1 1 140px'
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  color: '#888',
  marginBottom: 4
}

const valueStyle = { fontSize: 22, lineHeight: 1.15 }

export const Tile = ({ label, hint, children }) => (
  <div style={tileStyle}>
    <span style={labelStyle} title={hint}>{label}</span>
    <div style={valueStyle}>{children}</div>
  </div>
)

export const TileRow = ({ children, style }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, ...style }}>
    {children}
  </div>
)
