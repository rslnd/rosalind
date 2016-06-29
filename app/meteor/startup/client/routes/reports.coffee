{ FlowRouter } = require 'meteor/kadira:flow-router'
{ BlazeLayout } = require 'meteor/kadira:blaze-layout'

module.exports = ->
  reports = FlowRouter.group
    prefix: '/reports'

  reports.route '/:date',
    name: 'reports.dashboard'
    action: ->
      BlazeLayout.render('layout', main: 'reports')


  reports.route '/',
    name: 'reports.dashboard'
    action: ->
      BlazeLayout.render('layout', main: 'reports')
