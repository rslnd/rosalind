import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

const marginStyle = {
  margin: 100
}

export const Loading = () => (
  <div className='loading'>
    <CircularProgress
      key='loading'
      size={70}
      thickness={4}
      style={marginStyle} />
  </div>
)
