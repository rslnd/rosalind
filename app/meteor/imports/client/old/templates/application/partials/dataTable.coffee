import './dataTable.tpl.jade'
import { __ } from '../../../../../i18n'

Template.dataTable.helpers
  thisInsert: ->
    __(@table.collection._name + '.thisInsert')

Template.dataTable.events
  'click [rel="new"]': ->
    Modal.show 'modalAutoForm',
      type: 'insert'
      collection: @table.collection
      formTemplate: @formTemplate
