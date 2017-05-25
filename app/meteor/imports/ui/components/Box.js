import React from 'react'
import classnames from 'classnames'
import { Icon } from './Icon'

export class Box extends React.Component {
  render () {
    const typeClass = this.props.type ? `box-${this.props.type}` : 'default'
    const boxClasses = classnames({
      box: true,
      [ typeClass ]: true
    })
    const headerClasses = classnames({
      'box-header': true,
      'with-border': !this.props.noBorder
    })
    const bodyClasses = classnames({
      'box-body': true,
      'no-padding': this.props.noPadding
    })

    return (
      <div className={boxClasses}>
        {this.props.title &&
          <div className={headerClasses}>
            {this.props.icon && <Icon name={this.props.icon} />}
            <h3 className='box-title'>{this.props.title}</h3>
            {this.props.buttons && <div className='pull-right'>{this.props.buttons}</div>}
          </div>
        }
        <div className={bodyClasses}>{this.props.body || this.props.children}</div>
        {
          this.props.footer && this.props.footer
        }
      </div>
    )
  }
}
