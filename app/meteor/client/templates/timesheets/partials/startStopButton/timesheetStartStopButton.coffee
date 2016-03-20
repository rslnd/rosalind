Template.timesheetStartStopButton.events
  'click [rel="start"]': (e) ->
    e.stopPropagation()
    Meteor.call('timesheets/startTracking')

  'click [rel="stop"]': (e) ->
    e.stopPropagation()
    Meteor.call('timesheets/stopTracking')
