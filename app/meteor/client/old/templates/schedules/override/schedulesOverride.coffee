{ override } = require 'api/schedules/tables'

Template.schedulesOverride.helpers
  formTemplate: ->
    'schedulesOverrideForm'

  table: ->
    override
