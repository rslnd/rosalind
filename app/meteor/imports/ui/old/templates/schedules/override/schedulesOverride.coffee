import { override } from 'api/schedules/tables'

Template.schedulesOverride.helpers
  formTemplate: ->
    'schedulesOverrideForm'

  table: ->
    override
