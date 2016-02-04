reports = FlowRouter.group
  prefix: '/reports'

reports.route '/',
  name: 'reports.dashboard'
  action: ->
    BlazeLayout.render('layout', main: 'reportsDashboard')
