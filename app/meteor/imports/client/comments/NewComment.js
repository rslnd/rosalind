import React from 'react'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { Avatar } from '../users/Avatar'
import { TextField, handleKeyPress } from '../components/form/TextField'

export class NewComment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      body: ''
    }

    this.handleBodyChange = this.handleBodyChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleBodyChange (e) {
    this.setState({ body: e.target.value })
  }

  handleSubmit (e) {
    e.preventDefault()
    let body = this.state.body.trim()
    if (body) {
      Meteor.call('comments/post', { body, docId: this.props.docId })
      this.setState({ body: '' })
    }
  }

  render () {
    return (
      <div className='box-footer' style={this.props.style}>
        <form onSubmit={this.handleSubmit}>
          <Avatar />
          <div className='img-push input-group input-group-sm'>
            <label className='sr-only' htmlFor={'new-comment-' + this.props.docId} >
              {__('ui.newCommentPlaceholder')}
            </label>
            <TextField
              fullWidth
              multiline
              value={this.state.body}
              placeholder={__('ui.newCommentPlaceholder')}
              autoFocus={this.props.autoFocus}
              onChange={this.handleBodyChange}
              onKeyPress={handleKeyPress(this.handleSubmit)}
            />
            <span className='input-group-btn'>
              <button
                type='button'
                style={buttonStyle}
                onClick={this.handleSubmit}
                title={__('ui.newCommentPost')}
                className='btn btn-default btn-flat no-border-radius'>
                <i className='fa fa-arrow-right text-muted' />
              </button>
            </span>
          </div>
        </form>
      </div>
    )
  }
}

const buttonStyle = {
  marginLeft: 6
}
