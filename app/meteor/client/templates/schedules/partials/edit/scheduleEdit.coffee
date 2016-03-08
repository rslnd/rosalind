Template.scheduleEdit.helpers
  formType: ->
    if @doc then 'update' else 'insert'

AutoForm.hooks
  afScheduleForm:
    before:
      update: (doc) ->
        if doc.$set?.items?
          doc.$set.items = _.without(doc.$set.items, null)
        doc
