import React from 'react'

export const ContentHeader = ({ title, subtitle }) => (
  <div className='content-header'>
    <h1>{title} <span className='subtitle'>{subtitle}</span></h1>
  </div>
)
