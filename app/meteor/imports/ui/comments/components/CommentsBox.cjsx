React = require 'react'
{ CommentsList } = require './CommentsList.cjsx'
{ NewComment } = require './NewComment.cjsx'

class CommentsBox extends React.Component
  render: ->
    <div>
      <CommentsList comments=@props.comments />
      <NewComment docId=@props.docId />
    </div>

module.exports = { CommentsBox }
