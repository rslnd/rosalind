Subs = new SubsManager()

Router.route '/appointments'

Router.route '/appointments/new', ->
  @render('newAppointment')
