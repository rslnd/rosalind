Template.comments.helpers
  comments: ->
    Comments.find({ docId: @_id }).fetch()

UI.registerHelper 'commentCount', ->
  Comments.find({ docId: @_id }).count()


UI.registerHelper 'hasComments', ->
  (Comments.find({ docId: @_id }).count() > 0)


UI.registerHelper 'humanCommentCount', ->
  count = Comments.find({ docId: @_id }).count()
  human = TAPi18n.__('ui.comment', { count })
  count + ' ' + human

Template.comments.events
  'submit form.add-comment': (e) ->
    input = $(e.target).find('.add-comment-body')
    Comments.insert({ body: input.val(), docId: @_id })
    input.val('')
    false
