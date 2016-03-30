module.exports = ->
  inboundCalls = FlowRouter.group
    prefix: '/inboundCalls'

  inboundCalls.route '/',
    name: 'inboundCalls.thisOpen'
    action: ->
      BlazeLayout.render('layout', main: 'inboundCalls')

  inboundCalls.route '/resolved',
    name: 'inboundCalls.thisResolved'
    action: ->
      BlazeLayout.render('layout', main: 'inboundCallsResolved')

  inboundCalls.route '/new',
    name: 'inboundCalls.thisInsert'
    action: ->
      BlazeLayout.render('layout', main: 'newInboundCall')
