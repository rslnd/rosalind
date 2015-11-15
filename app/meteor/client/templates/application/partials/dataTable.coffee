Template.dataTable.helpers
  thisInsert: ->
    TAPi18n.__(@table.collection._name + '.thisInsert')

Template.dataTable.events
  'click .this-insert': ->
    Modal.show('modalAutoForm', { type: 'insert', collection: @table.collection })
