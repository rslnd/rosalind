{ TAPi18n } = require 'meteor/tap:i18n'

Template.dataTable.helpers
  thisInsert: ->
    TAPi18n.__(@table.collection._name + '.thisInsert')

Template.dataTable.events
  'click [rel="new"]': ->
    Modal.show 'modalAutoForm',
      type: 'insert'
      collection: @table.collection
      formTemplate: @formTemplate
