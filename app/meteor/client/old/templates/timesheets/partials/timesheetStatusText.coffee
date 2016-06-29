moment = require 'moment'
require 'moment-duration-format'

{ Meteor } = require 'meteor/meteor'
{ Deps } = require 'meteor/deps'
{ Timesheets } = require 'api/timesheets'

tickerDep = new Deps.Dependency
tickerInterval = null

Template.timesheetStatusText.onRendered ->
  tickerInterval = setInterval((-> tickerDep.changed()), 1000)

Template.timesheetStatusText.onDestroyed ->
  clearInterval(tickerInterval)


Template.timesheetStatusText.helpers
  workedToday: ->
    tickerDep.depend()
    duration = Timesheets.methods.sum(Meteor.user().timesheets())
    moment.duration(duration, 'ms').format('h[h] mm[m] ss[s]')
