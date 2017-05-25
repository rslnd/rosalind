import React from 'react'
import { Box } from './Box'

export const Error = ({ message }) => (
  <div className='content'>
    <Box
      type='danger'
      icon='exclamation-triangle'
      title='Fehler'>

      <p>Entschuldigung, das hätte nicht passieren dürfen.</p>

      {
        window.Smooch && <div>
          <p>Bitte öffne den Chat rechts unten und beschribe kurz,<br />
          was du gerade machen wolltest und wo du zuletzt geklickt hast.</p>
          <p><b>Danke!</b><br /></p>
        </div>
      }
    </Box>
  </div>
)
