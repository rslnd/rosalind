import React from 'react'
import { Avatar } from '../users/Avatar'
import { UserHelper } from '../users/UserHelper'
import { RelativeTime } from '../helpers/RelativeTime'

const childCommentStyle = {
  paddingTop: 4,
  paddingBottom: 4,
  borderTop: '1px solid #eee'
}

const ChildCommentItem = ({ comment }) => (
  <div style={childCommentStyle}>
    <span className='text-muted pull-right'><RelativeTime time={comment.createdAt} /></span>
    {comment.body}
  </div>
)

export class CommentItem extends React.Component {
  render () {
    const { createdBy, createdAt, body, children } = this.props.comment

    return (
      <div className='box-comment'>
        <div><Avatar userId={createdBy} /></div>
        <div className='comment-text'>
          <span className='username'>
            <span><UserHelper userId={createdBy} helper='fullName' /></span>
            <span className='text-muted pull-right'><RelativeTime time={createdAt} /></span>
          </span>
          <p className='enable-select break-word'>
            {body}
            {
              children && children.map(c =>
                <ChildCommentItem key={c._id} comment={c} />
              )
            }
          </p>
        </div>
      </div>
    )
  }
}
