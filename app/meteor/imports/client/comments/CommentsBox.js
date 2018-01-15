import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export const CommentsBox = ({ comments, docId, newComment = true, autoFocus, background }) => {
  return (
    <div>
      <CommentsList
        comments={comments}
        background={background}
      />
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
