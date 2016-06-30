import React from 'react'
import { Avatar } from 'client/ui/users/components/Avatar'
import { UserHelper } from 'client/ui/users/components/UserHelper'
import { RelativeTime } from 'client/ui/helpers/RelativeTime'

export const Comment = ({ comment }) => {
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

export const CommentsList = ({ comments }) => {
  if (comments.length === 0) {
    return null
  } else {
    return (
      <div className="box-footer box-comments">
        {comments.map((comment) => {
          return <Comment key={comment._id} comment={comment} />
        })}
      </div>
    )
  }
}
