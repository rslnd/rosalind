{ holidays } = require '/imports/api/schedules/tables'

Template.holidays.helpers
  formTemplate: ->
    'holidaysForm'

  table: ->
    holidays
