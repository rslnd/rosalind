import moment from 'moment-timezone'
import map from 'lodash/map'
import last from 'lodash/last'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import Time from '../../util/time'
import { Timesheets } from '../timesheets'

module.exports =
  timesheets: (options = {}) ->
    options.from ||= Time.startOfToday()

    timesheets = Timesheets.find
      userId: @_id
      start: { $gte: options.from }

    timesheets.fetch()

  lastTimesheet: ->
    Timesheets.findOne({ userId: @_id }, sort: { start: -1 })

  getRoles: ->
    Roles.getRolesForUser(@_id).join(', ')

  lastToken: ->
    last(@services?.resume?.loginTokens)?.hashedToken
