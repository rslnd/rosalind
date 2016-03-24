Template.editLink.events
  'click [rel="edit"]': ->
    Modal.show 'modalAutoForm',
      type: 'update'
      collection: @collection
      doc: @
      formTemplate: @formTemplate
