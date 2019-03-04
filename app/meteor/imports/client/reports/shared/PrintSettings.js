import React from 'react'

export const PrintSettings = ({ orientation }) => {
  if (orientation !== 'landscape' && orientation !== 'portrait') {
    console.error('[PrintSettings] Invalid orientation', orientation)
  }

  const style = `
    @media print {
      @page { size: ${orientation}; }
    }
  `

  return (
    <style dangerouslySetInnerHTML={{ __html: style }} />
  )
}
