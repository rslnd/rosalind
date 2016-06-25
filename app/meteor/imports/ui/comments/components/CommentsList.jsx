import React from 'react'
import { Avatar } from '/imports/ui/users/components/Avatar'
import { UserHelper } from '/imports/ui/users/components/UserHelper'
import { RelativeTime } from '/imports/ui/helpers/RelativeTime'

const CommentsList = ({ comments }) => {
  if (comments.length === 0)
    return null
  else
    return (
      <div className='box-footer box-comments'>
        { comments.map((comment) => (

          <div key={ comment._id } className='box-comment'>
            <div><Avatar _id={ comment.createdBy } /></div>
            <div className='comment-text'>
              <span className='username'>
                <span><UserHelper _id={ comment.createdBy } helper='fullName' /></span>
                <span className='text-muted pull-right'><RelativeTime time={ comment.createdAt } /></span>
              </span>
              <p className='enable-select break-word'>{ comment.body }</p>
            </div>
          </div>

        ))}
      </div>
    )
}

export { CommentsList }
