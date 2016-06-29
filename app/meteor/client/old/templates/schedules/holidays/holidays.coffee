{ holidays } = require 'api/schedules/tables'

Template.holidays.helpers
  formTemplate: ->
    'holidaysForm'

  table: ->
    holidays
