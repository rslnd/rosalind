schedules = FlowRouter.group
  prefix: '/schedules'

schedules.route '/default/:username?',
  name: 'schedules.thisDefault'
  action: ->
    BlazeLayout.render('layout', main: 'schedulesDefault')

schedules.route '/overrides/:username?',
  name: 'schedules.overrides'
  action: ->
    BlazeLayout.render('layout', main: 'schedulesOverrides')

schedules.route '/businessHours',
  name: 'schedules.businessHours'
  action: ->
    BlazeLayout.render('layout', main: 'businessHours')

schedules.route '/holidays',
  name: 'schedules.holidays'
  action: ->
    BlazeLayout.render('layout', main: 'holidays')
