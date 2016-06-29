import React from 'react'
import { Avatar } from 'client/ui/users/components/Avatar'
import { UserHelper } from 'client/ui/users/components/UserHelper'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export class Comment extends React.Component {
  render () {
    return (
      <div className='box-comment'>
        <div><Avatar userId={this.props.comment.createdBy} /></div>
        <div className='comment-text'>
          <span className='username'>
            <span><UserHelper userId={this.props.comment.createdBy} helper='fullName' /></span>
            <span className='text-muted pull-right'><RelativeTime time={this.props.comment.createdAt} /></span>
          </span>
          <p className='enable-select break-word'>{this.props.comment.body}</p>
        </div>
      </div>
    )
  }
}

export class CommentsList extends React.Component {
  render () {
    if (this.props.comments.length === 0) {
      return null
    } else {
      return (
        <div className='box-footer box-comments'>
          {this.props.comments.map((comment) => {
            return <Comment key={comment._id} comment={comment} />
          })}
        </div>
      )
    }
  }
}
