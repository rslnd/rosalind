import React from 'react'
import { Icon } from '../../components/Icon'
import { grow, flex } from '../../components/form'

const iconDefaultStyle = {
  textAlign: 'center',
  paddingLeft: 6,
  paddingRight: 6,
  minWidth: 50,
}

export const ListItem = ({ icon, children, hr, style, iconStyle, highlight, onClick }) => {
  const containerStyle = highlight
    ? {
      ...style,
      backgroundColor: '#FFF9C4',
      cursor: onClick ? 'pointer' : undefined
    } : style

  return <div style={containerStyle} onClick={onClick}>
    <div style={flex}>
      <div style={{ ...iconDefaultStyle, ...iconStyle }}>
        {icon && <Icon name={icon} />}
      </div>
      <div style={grow} className='enable-select'>
        {children}
      </div>
    </div>
    {hr && <hr />}
  </div>
}
