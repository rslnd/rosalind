import React from 'react'

export class Box extends React.Component {
  render () {
    return (
      <div className={`box box-${this.props.type || 'default'}`}>
        <div className="box-header with-border">
          <h3 className="box-title">{this.props.title}</h3>
        </div>
        <div className="box-body">{this.props.body}</div>
      </div>
    )
  }
}
