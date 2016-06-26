React = require 'react'
{ Avatar } = require '/imports/ui/users/components/Avatar.cjsx'
{ UserHelper } = require '/imports/ui/users/components/UserHelper.cjsx'
{ RelativeTime } = require '/imports/ui/helpers/RelativeTime.cjsx'

class Comment extends React.Component
  render: ->
    <div className='box-comment'>
      <div><Avatar _id=@props.comment.createdBy /></div>
      <div className='comment-text'>
        <span className='username'>
          <span><UserHelper _id=@props.comment.createdBy helper='fullName' /></span>
          <span className='text-muted pull-right'><RelativeTime time=@props.comment.createdAt /></span>
        </span>
        <p className='enable-select break-word'>{ @props.comment.body }</p>
      </div>
    </div>

class CommentsList extends React.Component
  render: ->
    if @props.comments.length is 0
      return null
    else
      <div className='box-footer box-comments'>
        { <Comment key=comment._id comment=comment /> for comment in @props.comments }
      </div>

module.exports = { CommentsList }
