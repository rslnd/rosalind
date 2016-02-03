users = FlowRouter.group
  prefix: '/system'

users.route '/',
  name: 'system.this'
  action: ->
    BlazeLayout.render('layout', main: 'systemDashboard')

users.route '/jobs',
  name: 'system.thisJobs'
  action: ->
    BlazeLayout.render('layout', main: 'jobs')
