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
  actions,
  setCollapsed,
  collapsed
}) =>
  collapsed
    ? <Collapsed
      comments={comments}
      setCollapsed={setCollapsed}
    />
    : (
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

const Collapsed = ({ comments, setCollapsed }) =>
  <div
    style={collapsedStyle}
    onClick={() => setCollapsed(false)}
    title='Anmerkungen'
  >
    {comments.length} Anm.
  </div>

const collapsedStyle = {
  opacity: 0.6,
  padding: 4,
  textAlign: 'right'
}
