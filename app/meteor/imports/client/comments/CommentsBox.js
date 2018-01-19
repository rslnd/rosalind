import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export const CommentsBox = ({ comments, docId, newComment = true, autoFocus }) => {
  return (
    <div>
      <CommentsList comments={comments} />
      {
        newComment &&
          <NewComment
            docId={docId}
            autoFocus={autoFocus}
          />
      }
    </div>
  )
}
