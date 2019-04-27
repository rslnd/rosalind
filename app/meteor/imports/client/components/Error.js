import React from 'react'
import { Box } from './Box'

export const Error = ({ message }) => (
  <div className='content' style={pseudoContentStyle}>
    <Box
      type='danger'
      icon='exclamation-triangle'
      title='Fehler'>

      <p>Entschuldigung, das hätte nicht passieren dürfen.</p>

      <p className='hide-print'>Bitte öffne den Chat rechts unten und beschribe kurz,<br />
        was Du gerade machen wolltest und wo Du zuletzt geklickt hast.</p>

      <p className='hide-print'><b>Danke</b><br /></p>
    </Box>
  </div>
)

const pseudoContentStyle = {
  minHeight: 0
}
