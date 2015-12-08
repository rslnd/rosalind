Subs = new SubsManager()

Router.route '/appointments',
  subscriptions: -> Subs.subscribe('appointments')
  data: -> { appointments: Appointments.find({}) }


Router.route '/appointments/new', ->
  @render('newAppointment')
