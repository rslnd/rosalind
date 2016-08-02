import React from 'react'
import { Icon } from './Icon'

export class Box extends React.Component {
  render () {
    return (
      <div className={`box box-${this.props.type || 'default'}`}>
        {this.props.title &&
          <div className="box-header with-border">
            {this.props.icon && <Icon name={this.props.icon} />}
            <h3 className="box-title">{this.props.title}</h3>
          </div>
        }
        <div className={`box-body ${this.props.noPadding && 'no-padding'}`}>{this.props.body || this.props.children}</div>
      </div>
    )
  }
}
