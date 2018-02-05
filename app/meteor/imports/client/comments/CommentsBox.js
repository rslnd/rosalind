import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export const CommentsBox = ({ comments, docId, newComment = true, autoFocus, onClick, onRemove }) => {
  return (
    <div>
      <CommentsList
        onClick={onClick}
        comments={comments}
        onRemove={onRemove} />
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
