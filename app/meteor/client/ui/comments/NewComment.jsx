import React from 'react'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Avatar } from 'client/ui/users/Avatar'

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
      <div className="box-footer">
        <form onSubmit={this.handleSubmit}>
          <Avatar />
          <div className="img-push input-group input-group-sm">
            <label className="sr-only" htmlFor={'new-comment-' + this.props.docId} >
              {TAPi18n.__('ui.press_enter_to_post_comment')}
            </label>
            <input type="text"
              className="form-control input-sm"
              id={'new-comment-' + this.props.docId}
              placeholder={TAPi18n.__('ui.press_enter_to_post_comment')}
              value={this.state.body}
              onChange={this.handleBodyChange} />
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default btn-flat no-border-radius">
                <i className="fa fa-arrow-right text-muted"></i>
              </button>
            </span>
          </div>
        </form>
      </div>
    )
  }
}
