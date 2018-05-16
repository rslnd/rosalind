import './modalAutoForm.tpl.jade'
import inflector from 'inflected'

Template.modalAutoForm.helpers
  title: ->
    if @newTitle
      __(@newTitle)
    else
      collectionName = @collection?._name
      collectionName = @collection?()?._name if not collectionName?

      __(collectionName + '.this' + inflector.capitalize(@type))

AutoForm.hooks
  modalAutoForm:
    onSuccess: -> Modal.hide()
