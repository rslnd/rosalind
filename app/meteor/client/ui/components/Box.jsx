import React from 'react'

export const Box = ({ title, type, body }) => (
  <div className={`box box-${type || 'default'}`}>
    <div className="box-header with-border">
      <h3 className="box-title">{title}</h3>
    </div>
    <div className="box-body">{body}</div>
  </div>
)
