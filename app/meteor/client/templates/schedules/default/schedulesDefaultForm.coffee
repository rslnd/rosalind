Template.schedulesDefaultForm.helpers
  getDefaultScheduleForViewUser: ->
    doc = Schedules.findOne({ userId: @viewUser._id })
    if doc then doc else { userId: @viewUser._id }

  formType: ->
    doc = Schedules.findOne({ userId: @viewUser._id })
    if doc then 'update' else 'insert'


AutoForm.hooks
  afSchedulesDefaultForm:
    before:
      update: (doc) ->
        if doc.$set?.items?
          doc.$set.items = _.without(doc.$set.items, null)
        doc
