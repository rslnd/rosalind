import React from 'react'
import FlipMove from 'react-flip-move'
import { CommentItem } from './CommentItem'

export const CommentsList = ({ comments }) => {
  if (comments.length === 0) {
    return null
  } else {
    return (
      <div className="box-footer box-comments">
        <FlipMove>
          {comments.map((comment) => {
            return <CommentItem key={comment._id} comment={comment} />
          })}
        </FlipMove>
      </div>
    )
  }
}
