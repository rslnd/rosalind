import React from 'react'
import { Avatar } from 'client/ui/users/Avatar'
import { UserHelper } from 'client/ui/users/UserHelper'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export class CommentItem extends React.Component {
  render () {
    return (
      <div className="box-comment">
        <div><Avatar userId={this.props.comment.createdBy} /></div>
        <div className="comment-text">
          <span className="username">
            <span><UserHelper userId={this.props.comment.createdBy} helper="fullName" /></span>
            <span className="text-muted pull-right"><RelativeTime time={this.props.comment.createdAt} /></span>
          </span>
          <p className="enable-select break-word">{this.props.comment.body}</p>
        </div>
      </div>
    )
  }
}
