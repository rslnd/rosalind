helpers = require './helpers'

Template.humanCommentCount.helpers
  hasComments: ->
    helpers.hasComments(@)

  humanCommentCount: ->
    helpers.humanCommentCount(@)
