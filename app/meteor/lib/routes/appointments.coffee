appointments = FlowRouter.group
  name: 'appointments'
  prefix: '/appointments'

appointments.route '/',
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

appointments.route '/:status',
  name: 'appointments.thisOpen'
  action: ->
    BlazeLayout.render('layout', main: 'appointmentsCards')
