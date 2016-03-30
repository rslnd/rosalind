Template.businessHours.helpers
  regular: ->
    Schedules.findOne(type: 'businessHours')

  formTemplate: ->
    'businessHoursOverrideForm'

Template.businessHours.events
  'click [rel="editRegular"]': ->

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: Schedules.findOne(type: 'businessHours')
