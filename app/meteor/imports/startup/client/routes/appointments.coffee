{ FlowRouter } = require 'meteor/kadira:flow-router'
{ BlazeLayout } = require 'meteor/kadira:blaze-layout'

module.exports = ->
  appointments = FlowRouter.group
    name: 'appointments'
    prefix: '/appointments'

  appointments.route '/open',
    name: 'appointments.thisOpen'
    action: ->
      BlazeLayout.render('layout', main: 'appointments')

  appointments.route '/resolved',
    name: 'appointments.thisResolved'
    action: ->
      BlazeLayout.render('layout', main: 'appointmentsResolved')

  appointments.route '/new',
    name: 'appointments.thisInsert'
    action: ->
      BlazeLayout.render('layout', main: 'newAppointment')

  appointments.route '/:date',
    name: 'appointments.this'
    action: ->
      BlazeLayout.render('layout', main: 'appointments')

  appointments.route '/',
    name: 'appointments.this'
    action: ->
      BlazeLayout.render('layout', main: 'appointments')
