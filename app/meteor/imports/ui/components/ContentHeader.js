import React from 'react'

export const ContentHeader = ({ title, subtitle }) => (
  <div className='content-header'>
    <h1>{title}<subtitle>{subtitle}</subtitle></h1>
  </div>
)
