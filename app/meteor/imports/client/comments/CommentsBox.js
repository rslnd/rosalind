import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'

export const CommentsBox = ({
  comments,
  docId,
  newComment = true,
  autoFocus,
  onClick,
  onEdit,
  onRemove,
  canEdit,
  style,
  actions
}) => {
  return (
    <div>
      <CommentsList
        canEdit={canEdit}
        onClick={onClick}
        onEdit={onEdit}
        comments={comments}
        onRemove={onRemove}
        style={style} />
      {
        newComment &&
          <NewComment
            docId={docId}
            autoFocus={autoFocus}
            style={style}
            actions={actions}
          />
      }
    </div>
  )
}
