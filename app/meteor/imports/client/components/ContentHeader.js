import React from 'react'

export const ContentHeader = ({ title, children, subtitle }) => (
  <div className='content-header'>
    <h1>{title || children} <span className='subtitle'>{subtitle}</span></h1>
  </div>
)
