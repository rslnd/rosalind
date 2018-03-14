import React from 'react'
import classnames from 'classnames'

export const Icon = ({ name, spin, flipHorizontal, className, style, title }) => {
  return <i className={classnames({
    [`fa-${name}`]: true,
    'fa': true,
    'fa-spin': spin,
    'fa-flip-horizontal': flipHorizontal,
    [className]: className
  })} style={style} title={title} />
}
