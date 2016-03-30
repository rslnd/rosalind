{ Comments } = require '/imports/api/comments'

Template.comments.helpers
  comments: ->
    Comments.find({ docId: @_id }).fetch()

Template.comments.events
  'submit form.add-comment': (e) ->
    input = $(e.target).find('.add-comment-body')
    Comments.insert({ body: input.val(), docId: @_id })
    input.val('')
    false
