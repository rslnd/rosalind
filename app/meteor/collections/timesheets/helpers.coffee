Meteor.startup ->
  Timesheets.helpers
    duration: ->
      moment(@end).diff(moment(@start))
