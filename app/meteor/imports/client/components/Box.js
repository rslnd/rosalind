import React from 'react'
import classnames from 'classnames'
import { Icon } from './Icon'

export class Box extends React.Component {
  render () {
    const {
      type,
      noBorder,
      noPadding,
      style,
      boxStyle,
      title,
      icon,
      buttons,
      children,
      body,
      footer,
      color
    } = this.props

    const typeClass = type ? `box-${type}` : 'default'
    const boxClasses = classnames({
      box: true,
      [ typeClass ]: true
    })
    const headerClasses = classnames({
      'box-header': true,
      'with-border': !noBorder
    })
    const bodyClasses = classnames({
      'box-body': true,
      'no-padding': noPadding
    })

    const borderTopStyle = color ? {
      borderTopColor: color
    } : {}

    const outerStyle = {
      ...borderTopStyle,
      ...boxStyle
    }

    return (
      <div className={boxClasses} style={outerStyle}>
        {title &&
          <div className={headerClasses}>
            {icon && <Icon name={icon} />}
            <h3 className='box-title'>{title}</h3>
            {buttons && <div className='pull-right'>{buttons}</div>}
          </div>
        }
        <div className={bodyClasses} style={style}>{body || children}</div>
        {
          footer && footer
        }
      </div>
    )
  }
}
