{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
{ Appointments } = require 'api/appointments'

module.exports = ->
  Meteor.methods
    'system/stats/appointments': ->
      return unless @userId and Roles.userIsInRole(@userId, ['admin'], Roles.GLOBAL_GROUP)

      return {
        appointmentsTotal: Appointments.find().count()
        appointmentsHeuristic: Appointments.find(heuristic: true).count()
        appointmentsUnmapped: Appointments.find(patientId: null).count()
        appointmentsMapped: Appointments.find(patientId: { $ne: null }).count()
      }
