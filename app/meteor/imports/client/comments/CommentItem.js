import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { __ } from '../../i18n'
import { Avatar } from '../users/Avatar'
import { UserHelper } from '../users/UserHelper'
import { RelativeTime } from '../helpers/RelativeTime'

const childCommentStyle = {
  display: 'block',
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

const ChildCommentItem = ({ comment, onRemove }) => (
  <span style={childCommentStyle}>
    <span className='text-muted pull-right'>
      {onRemove && <RemoveLink comment={comment} onRemove={onRemove} />}
      <RelativeTime time={comment.createdAt} />
    </span>
    {comment.body}
  </span>
)

export class CommentItem extends React.Component {
  render () {
    const { comment, onRemove } = this.props
    const { createdBy, createdAt, body, children } = comment    

    return (
      <div className='box-comment'>
        <div><Avatar userId={createdBy} /></div>
        <div className='comment-text'>
          <span className='username'>
            <span><UserHelper userId={createdBy} helper='fullName' /></span>
            <span className='text-muted pull-right'>
              {onRemove && <RemoveLink comment={comment} onRemove={onRemove} />}
              <RelativeTime time={createdAt} />
            </span>
          </span>
          <p className='enable-select break-word'>
            {body}
            {
              children && children.map(c =>
                <ChildCommentItem
                  key={c._id}
                  comment={c}
                  onRemove={onRemove} />
              )
            }
          </p>
        </div>
      </div>
    )
  }
}
