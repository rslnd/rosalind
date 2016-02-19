Template.editLink.events
  'click a': ->
    Modal.show 'modalAutoForm',
      type: 'update'
      collection: @collection
      doc: @
