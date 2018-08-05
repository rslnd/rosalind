import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

const containerStyle = {
  textAlign: 'center',
  width: '100%'
}

const defaultStyle = {
  margin: 100
}

export const Loading = ({ size = 70, thickness = 4, style = defaultStyle }) => (
  <div className='loading' style={containerStyle} >
    <CircularProgress
      key='loading'
      size={size}
      thickness={thickness}
      style={style}
    />
  </div>
)
