import React from 'react'
import { Avatar } from 'client/ui/users/Avatar'
import { UserHelper } from 'client/ui/users/UserHelper'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export const CommentItem = ({ comment }) => {
  return (
    <div className="box-comment">
      <div><Avatar userId={comment.createdBy} /></div>
      <div className="comment-text">
        <span className="username">
          <span><UserHelper userId={comment.createdBy} helper="fullName" /></span>
          <span className="text-muted pull-right"><RelativeTime time={comment.createdAt} /></span>
        </span>
        <p className="enable-select break-word">{comment.body}</p>
      </div>
    </div>
  )
}
