moment = require 'moment-timezone'
map = require 'lodash/map'
last = require 'lodash/last'
{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
{ TAPi18n } = require 'meteor/tap:i18n'
Time = require 'util/time'
{ Timesheets } = require 'api/timesheets'

module.exports =
  timesheets: (options = {}) ->
    options.from ||= Time.startOfToday()

    timesheets = Timesheets.find
      userId: @_id
      start: { $gte: options.from }

    timesheets.fetch()

  lastTimesheet: ->
    Timesheets.findOne({ userId: @_id }, sort: { start: -1 })

  shortname: ->
    if (@username.length <= 3)
      @username
    else
      map(@fullName().split(' '), (n) -> n.charAt(0) ).join('')

  getRoles: ->
    Roles.getRolesForUser(@_id).join(', ')

  lastToken: ->
    last(@services?.resume?.loginTokens)?.hashedToken
