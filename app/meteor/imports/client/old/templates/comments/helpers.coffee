import { __ } from '../../../../i18n'
import { Comments } from '../../../../api/comments'

module.exports =
  comments: (doc) ->
    Comments.find({ docId: doc._id })

  commentCount: (doc) ->
    Comments.find({ docId: doc._id }).count()

  hasComments: (doc) ->
    Comments.find({ docId: doc._id }).count() > 0

  humanCommentCount: (doc) ->
    count = Comments.find({ docId: doc._id }).count()
    human = __('ui.comment', { count })
    count + ' ' + human
