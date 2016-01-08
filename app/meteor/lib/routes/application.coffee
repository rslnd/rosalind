Router.configure
  layoutTemplate: 'layout'
  loadingTemplate: 'loading'

Router.route '/', ->
  @render('dashboard')
