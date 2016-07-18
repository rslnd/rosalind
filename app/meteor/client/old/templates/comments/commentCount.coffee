{ Modal } = require 'client/old/templates/application/modals/blazeModal'
helpers = require './helpers'

Template.commentCount.helpers
  commentCount: ->
    helpers.commentCount(@)

Template.commentCount.events
  'click .commentCount': ->
    Modal.show('commentsModal', @)
