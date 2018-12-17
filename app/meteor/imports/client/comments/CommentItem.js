import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { __ } from '../../i18n'
import { grow, shrink } from '../components/form/rowStyle'
import { Avatar } from '../users/Avatar'
import { UserHelper } from '../users/UserHelper'
import { RelativeTime } from '../helpers/RelativeTime'
import { InlineEdit } from '../components/form/InlineEdit'

const childCommentStyle = {
  display: 'flex',
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
      {
        canEdit
        ? <InlineEdit
          value={comment.body}
          onChange={onEdit(comment._id)}
          fieldStyle={inlineEditStyle}
          fullWidth
          noUI
          submitOnBlur
        />
        : comment.body
      }
    </div>
    <span className='text-muted align-right' style={shrink}>
      {onRemove && <RemoveLink comment={comment} onRemove={onRemove} />}
      <RelativeTime time={comment.createdAt} />
    </span>
  </span>
)

export class CommentItem extends React.Component {
  render () {
    const { comment, onRemove, onEdit, canEdit } = this.props
    const { createdBy, createdAt, body, children } = comment

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
            {
              canEdit
              ? <InlineEdit
                value={body}
                onChange={onEdit(comment._id)}
                fieldStyle={inlineEditStyle}
                fullWidth
                noUI
                submitOnBlur
              />
              : body
            }
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

const inlineEditStyle = {
  cursor: 'caret',
  display: 'inline-block'
}
