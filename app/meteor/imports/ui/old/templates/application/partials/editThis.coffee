import './editThis.tpl.jade'

Template.editThis.events
  'click [rel="edit"]': ->
    Modal.show 'modalAutoForm',
      type: 'update'
      collection: @collection
      doc: @
      formTemplate: @formTemplate
