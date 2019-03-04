import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { __ } from '../../i18n'
import { grow } from '../components/form/rowStyle'
import { Avatar } from '../users/Avatar'
import { UserHelper } from '../users/UserHelper'
import { RelativeTime } from '../helpers/RelativeTime'
import { InlineEdit } from '../components/form/InlineEdit'

const childCommentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 4,
  paddingBottom: 4,
  borderTop: '1px solid #eee'
}

const removeLinkStyle = {
  cursor: 'pointer'
}

const RemoveLink = ({ comment, onRemove }) => (
  (comment.createdBy === Meteor.userId() || Roles.userIsInRole(Meteor.userId(), ['admin'])) &&
    <span
      onClick={() => onRemove(comment._id)}
      style={removeLinkStyle}>
      {__('ui.removeComment')}
      &nbsp;
      &middot;
      &nbsp;
    </span>
)

const ChildCommentItem = ({ comment, onRemove, onEdit, canEdit }) => (
  <span style={childCommentStyle}>
    <div style={grow}>
      <Body comment={comment} onEdit={onEdit} canEdit={canEdit} />
    </div>
    <span className='text-muted align-right' style={noWrapStyle}>
      {onRemove && <RemoveLink comment={comment} onRemove={onRemove} />}
      <RelativeTime time={comment.createdAt} />
    </span>
  </span>
)

const noWrapStyle = {
  flexShrink: 0
}

export class CommentItem extends React.Component {
  render () {
    const { comment, onRemove, onEdit, canEdit } = this.props
    const { createdBy, createdAt, children } = comment

    return (
      <div className='box-comment'>
        <div><Avatar userId={createdBy} /></div>
        <div className='comment-text'>
          <span className='username'>
            <span><UserHelper userId={createdBy} helper='fullName' /></span>
            <span className='text-muted pull-right align-right'>
              {onRemove && <RemoveLink comment={comment} onRemove={onRemove} />}
              <RelativeTime time={createdAt} />
            </span>
          </span>
          <div className='enable-select break-word'>
            <Body comment={comment} onEdit={onEdit} canEdit={canEdit} />
            {
              children && children.map(c =>
                <ChildCommentItem
                  key={c._id}
                  comment={c}
                  onRemove={onRemove}
                  onEdit={onEdit}
                  canEdit={canEdit}
                />
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

const Body = ({ canEdit, comment, onEdit }) =>
  canEdit
    ? <InlineEdit
      multiline
      value={comment.body}
      onChange={onEdit(comment._id)}
      fieldStyle={inlineEditStyle}
      style={bodyStyle}
      fullWidth
      noUI
      submitOnBlur
      submitOnEnter
    />
    : <span style={bodyStyle}>
      {comment.body}
    </span>

// This must match the InlineEdit and MuiPrivateTextarea line height
const bodyStyle = {
  lineHeight: '16.625px',
  display: 'inline-block'
}

const inlineEditStyle = {
  cursor: 'caret',
  display: 'inline-block'
}
