patients = FlowRouter.group
  prefix: '/patients'

patients.route '/',
  name: 'patients.thisAll'
  action: ->
    BlazeLayout.render('layout', main: 'patients')

patients.route '/new',
  name: 'patients.thisNew'
  action: ->
    BlazeLayout.render('layout', main: 'newPatient')
