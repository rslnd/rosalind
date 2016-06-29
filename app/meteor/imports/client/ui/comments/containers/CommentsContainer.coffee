React = require 'react'
{ Comments } = require '/app/imports/api/comments'
{ CommentsBox } = require '../components/CommentsBox'
{ composeWithTracker } = require 'react-komposer'

composer = (props, onData) ->
  comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()
  onData(null, { comments, docId: props.docId })

CommentsContainer = composeWithTracker(composer)(CommentsBox)

module.exports = { CommentsContainer }
