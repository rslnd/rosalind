import React from 'react'
import { RelativeTime } from '/imports/ui/helpers/RelativeTime'
import { UserHelper } from '/imports/ui/users/components/UserHelper'

const CommentsList = ({ comments }) => (
  <div>{ comments.length != 0 ?
    <div className='box-footer box-comments'>
      { comments.map((comment) => (

        <div key={ comment._id } className='box-comment'>
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
  :
    null
  }</div>
)

export { CommentsList }
