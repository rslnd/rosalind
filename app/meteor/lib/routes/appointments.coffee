Router.route '/appointments/resolved'

Router.route '/appointments/new', ->
  @render('newAppointment')

Router.route '/appointments/:status?',
  template: 'appointments'
