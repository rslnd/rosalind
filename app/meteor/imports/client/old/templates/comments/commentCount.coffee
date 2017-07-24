import './commentCount.tpl.jade'
import { Modal } from '../application/modals/blazeModal'
import helpers from './helpers'

Template.commentCount.helpers
  commentCount: ->
    helpers.commentCount(@)

Template.commentCount.events
  'click .commentCount': ->
    Modal.show('commentsModal', @)
