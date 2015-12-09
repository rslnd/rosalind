Subs = new SubsManager()

Router.configure
  subscriptions: -> Subs.subscribe('appointments')

Router.route '/appointments',
  data: -> { appointments: Appointments.findOpen() }

Router.route '/appointments/admitted',
  data: -> { appointments: Appointments.findAdmitted() }
  template: 'appointments'

Router.route '/appointments/treating',
  data: -> { appointments: Appointments.findTreating() }
  template: 'appointments'

Router.route '/appointments/resolved'

Router.route '/appointments/new', ->
  @render('newAppointment')
