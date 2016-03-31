{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
{ Patients } = require '/imports/api/patients'

module.exports = ->
  Meteor.methods
    'system/stats/patients': ->
      return unless @userId and Roles.userIsInRole(@userId, ['admin'], Roles.GLOBAL_GROUP)

      return {
        patientsTotal: Patients.find().count()
        patientsPhone: Patients.find('profile.contacts': { $elemMatch: { channel: 'Phone' } }).count()
        patientsEmail: Patients.find('profile.contacts': { $elemMatch: { channel: 'Email' } }).count()
        patientsNoContact: Patients.find({
          'profile.contacts.email': null
          'profile.contacts.phone': null
        }).count()
      }
