schedules = FlowRouter.group
  prefix: '/schedules'

schedules.route '/default/:idOrUsername?',
  name: 'schedules.thisDefault'
  action: ->
    BlazeLayout.render('layout', main: 'schedulesDefault')
