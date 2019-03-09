import React from 'react'
import { getStyleNonce } from '../../layout/styles'

export const PrintSettings = ({ orientation }) => {
  if (orientation !== 'landscape' && orientation !== 'portrait') {
    console.error('[PrintSettings] Invalid orientation', orientation)
    return
  }

  const style = `
    @media print {
      @page { size: ${orientation}; }
    }
  `

  return (
    <style nonce={getStyleNonce()}>
      {style}
    </style>
  )
}
