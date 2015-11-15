Subs = new SubsManager()

Router.configure
  layoutTemplate: 'layout'
  loadingTemplate: 'loading'

Router.onBeforeAction ->
  Session.set('loaded', false)
  unless Meteor.user()
    @render('login')
  else
    Subs.subscribe('users')
    Subs.subscribe('groups')
    Subs.subscribe('counts')
    @next()

Router.onAfterAction ->
  Session.set('loaded', true)

Router.onAfterAction ->
  @render('login') unless Meteor.userId()

Router.route '/', ->
  @render('dashboard')
