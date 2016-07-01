import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export const CommentsBox = ({ comments, docId }) => {
  return (
    <div>
      <CommentsList comments={comments} />
      <NewComment docId={docId} />
    </div>
  )
}
