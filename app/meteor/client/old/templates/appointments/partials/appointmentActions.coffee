Template.appointmentActions.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()

Template.appointmentActions.events
  'click [rel="today"]': ->
    Template.appointments.currentView.set('date', new Date())

  'click [rel="previous"]': ->
    Template.appointments.currentView.previous()

  'click [rel="next"]': ->
    Template.appointments.currentView.next()
