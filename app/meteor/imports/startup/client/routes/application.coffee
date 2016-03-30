module.exports = ->
  FlowRouter.route '/',
    action: ->
      BlazeLayout.render('layout', main: 'dashboard')
