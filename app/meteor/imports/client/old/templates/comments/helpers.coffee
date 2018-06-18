import { TAPi18n } from 'meteor/tap:i18n'
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
    human = TAPi18n.__('ui.comment', { count })
    count + ' ' + human
