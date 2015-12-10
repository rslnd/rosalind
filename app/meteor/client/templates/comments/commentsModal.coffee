Template.commentsModal.helpers
  modalTitle: ->
    TAPi18n.__(@collection()._name + '.thisSingular')

  collectionItem: ->
    _.singularize(@collection()._name)
