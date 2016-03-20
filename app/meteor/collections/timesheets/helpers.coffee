Meteor.startup ->
  Timesheets.helpers
    duration: ->
      end = @end or new Date()
      end - @start
