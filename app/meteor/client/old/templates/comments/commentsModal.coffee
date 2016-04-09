_ = require 'lodash'
_.mixin require 'lodash-inflection'
{ TAPi18n } = require 'meteor/tap:i18n'

Template.commentsModal.helpers
  modalTitle: ->
    TAPi18n.__(@collection()._name + '.thisSingular')

  collectionItem: ->
    template = _.singularize(@collection()._name)
    template = template.charAt(0).toLowerCase() + template.slice(1)
    return template
