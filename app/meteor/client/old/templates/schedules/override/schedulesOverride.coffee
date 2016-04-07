{ override } = require '/imports/api/schedules/tables'

Template.schedulesOverride.helpers
  formTemplate: ->
    'schedulesOverrideForm'

  table: ->
    override
