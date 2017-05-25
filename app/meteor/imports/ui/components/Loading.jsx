import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'

export const Loading = () => (
  <div className="loading">
    <CircularProgress
      key="loading"
      size={119}
      thickness={7}
      style={{ margin: 10.5 }} />
  </div>
)
