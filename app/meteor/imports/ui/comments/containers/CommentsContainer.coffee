{ Comments } = require '/imports/api/comments'
{ CommentsList } = require '../components/CommentsList.cjsx'
{ composeWithTracker } = require 'react-komposer'

composer = (props, onData) ->
  comments = Comments.find({ docId: props.docId }, { sort: { createdAt: 1 } }).fetch()
  onData(null, { comments })

CommentsContainer = composeWithTracker(composer)(CommentsList)

module.exports = { CommentsContainer }
