{ capitalize } = require 'inflected'

Template.modalAutoForm.helpers
  title: ->
    if @newTitle
      TAPi18n.__(@newTitle)
    else
      collectionName = @collection?._name
      collectionName = @collection?()?._name if not collectionName?

      TAPi18n.__(collectionName + '.this' + capitalize(@type))

AutoForm.hooks
  modalAutoForm:
    onSuccess: -> Modal.hide()
