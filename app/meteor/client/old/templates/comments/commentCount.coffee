helpers = require './helpers'

Template.commentCount.helpers
  commentCount: ->
    helpers.commentCount(@)

Template.commentCount.events
  'click .commentCount': ->
    Modal.show('commentsModal', @)
