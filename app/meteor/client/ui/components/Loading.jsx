import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'

export const Loading = () => (
  <div className="loading">
    <CircularProgress key="loading" size={1.8} />
  </div>
)
