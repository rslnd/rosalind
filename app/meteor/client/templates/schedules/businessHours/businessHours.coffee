Template.businessHours.helpers
  total: -> 65

  schedule: ->
    Schedules.findOne(type: 'businessHours')

Template.businessHours.events
  'click [rel="edit"]': ->

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: Schedules.findOne(type: 'businessHours')
