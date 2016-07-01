React = require 'react'
{ FlowRouter } = require 'meteor/kadira:flow-router'
{ BlazeLayout } = require 'meteor/kadira:blaze-layout'
{ mount } = require 'react-mounter'
{ MainLayoutContainer } = require 'client/ui/layout'
{ InboundCallsContainer } = require 'client/ui/inboundCalls'

module.exports = ->
  inboundCalls = FlowRouter.group
    prefix: '/inboundCalls'

  inboundCalls.route '/',
    name: 'inboundCalls.thisOpen'
    action: ->
      mount(MainLayoutContainer, main: -> React.createElement(InboundCallsContainer))

  inboundCalls.route '/resolved',
    name: 'inboundCalls.thisResolved'
    action: ->
      BlazeLayout.render('layout', main: 'inboundCallsResolved')

  inboundCalls.route '/new',
    name: 'inboundCalls.thisInsert'
    action: ->
      BlazeLayout.render('layout', main: 'newInboundCall')
