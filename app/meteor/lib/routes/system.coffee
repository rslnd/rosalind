users = FlowRouter.group
  prefix: '/system'

users.route '/',
  name: 'system.this'
  action: ->
    BlazeLayout.render('layout', main: 'systemDashboard')

users.route '/jobs',
  name: 'system.thisJobs'
  action: ->
    BlazeLayout.render('layout', main: 'systemJobs')

users.route '/stats',
  name: 'system.thisStats'
  action: ->
    BlazeLayout.render('layout', main: 'systemStats')

users.route '/tags',
  name: 'system.thisTags'
  action: ->
    BlazeLayout.render('layout', main: 'systemTags')
