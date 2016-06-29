{ Schedules } = require 'api/schedules'
{ businessHoursOverride } = require 'api/schedules/tables'

Template.businessHours.helpers
  regular: ->
    Schedules.findOne(type: 'businessHours')

  formTemplate: ->
    'businessHoursOverrideForm'

  businessHoursOverrideTable: ->
    businessHoursOverride

Template.businessHours.events
  'click [rel="editRegular"]': ->

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: Schedules.findOne(type: 'businessHours')
