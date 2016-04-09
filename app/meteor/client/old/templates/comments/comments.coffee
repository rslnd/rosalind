{ Comments } = require '/imports/api/comments'
helpers = require './helpers'

Template.comments.helpers
  comments: ->
    helpers.comments(@)

  hasComments: ->
    helpers.hasComments(@)

Template.comments.events
  'submit form.add-comment': (e) ->
    input = $(e.target).find('.add-comment-body')
    Comments.insert({ body: input.val(), docId: @_id })
    input.val('')
    false
