import without from 'lodash/without'
import { Schedules } from 'api/schedules'

Template.scheduleEdit.helpers
  formType: ->
    if @doc then 'update' else 'insert'

  collection: ->
    Schedules

AutoForm.hooks
  afScheduleForm:
    before:
      update: (doc) ->
        if doc.$set?.items?
          doc.$set.items = without(doc.$set.items, null)
        doc
