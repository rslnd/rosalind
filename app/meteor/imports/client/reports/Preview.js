import React from 'react'
import { Box } from '../components/Box'
import { Week } from './Week'

export const Preview = ({ preview, mapUserIdToUsername }) => (
  <div className='row'>
    <div className='col-md-12'>
      <Box title='Auslastung und Dienstplan' icon='users'>
        <Week preview={preview} mapUserIdToUsername={mapUserIdToUsername} />
      </Box>
    </div>
  </div>
)