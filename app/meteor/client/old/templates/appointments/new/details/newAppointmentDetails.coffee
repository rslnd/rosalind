{ Tags } = require 'api/tags'

Template.newAppointmentDetails.helpers

  tags: ->
    Tags.find({}).fetch()

  tagClass: ->
    if _.indexOf(newAppointment.get('tags'), @_id) isnt -1
      if @color
        'label-' + @color
      else
        'label-primary'
    else
      'label-default'

Template.newAppointmentDetails.onCreated ->
  newAppointment.setDefault('tags', [])

Template.newAppointmentDetails.events
  'change [rel="employeeSelect"]': (e) ->
    _id = $(e.target).find('option:selected').data('id')
    console.log('[Appointments] New: select assignee', _id)
    newAppointment.set('assigneeId', _id)

  'click [rel="toggleTag"]': (e) ->
    _id = $(e.target).data('id')
    tags = newAppointment.get('tags')

    if _.indexOf(tags, _id) isnt -1
      tags = _.without(tags, _id)
      console.log('[Appointments] New: deselect tag', _id)
    else
      tags.push(_id)
      console.log('[Appointments] New: select tag', _id)

    newAppointment.set('tags', tags)
