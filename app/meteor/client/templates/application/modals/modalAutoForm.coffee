Template.modalAutoForm.helpers
  title: ->
    collectionName = @collection?._name
    collectionName = @collection?()?._name if not collectionName?

    TAPi18n.__(collectionName + '.this' + s.capitalize(@type))

AutoForm.hooks
  modalAutoForm:
    onSuccess: -> Modal.hide()
