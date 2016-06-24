{ FlowRouter } = require 'meteor/kadira:flow-router'
{ BlazeLayout } = require 'meteor/kadira:blaze-layout'

module.exports = ->
  FlowRouter.route '/',
    action: ->
      BlazeLayout.render('layout', main: 'dashboard')
