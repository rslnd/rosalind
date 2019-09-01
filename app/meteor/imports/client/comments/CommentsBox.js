
import React from 'react'
import { CommentsList } from './CommentsList'
import { NewComment } from './NewComment'
import { Icon } from '../components/Icon'

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
  <div>
    {
      setCollapsed &&
        <Collapsed
          comments={comments}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
    }

    {!collapsed &&
      <CommentsList
        canEdit={canEdit}
        onClick={onClick}
        onEdit={onEdit}
        comments={comments}
        onRemove={onRemove}
        style={style} />
    }
    {
      !collapsed && newComment &&
        <NewComment
          docId={docId}
          autoFocus={autoFocus}
          style={style}
          actions={actions}
        />
    }
  </div>

const Collapsed = ({ comments, setCollapsed, collapsed }) =>
  <div
    style={collapsedStyle}
    onClick={() => setCollapsed(!collapsed)}
    title='Anmerkungen'
  >
    {comments.length} Anm.
    &nbsp;
    <Icon name={collapsed ? 'caret-left' : 'caret-down'} />
  </div>

const collapsedStyle = {
  opacity: 0.6,
  padding: 4,
  textAlign: 'right'
}
