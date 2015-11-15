Router.route '/schedules/default/:idOrUsername?',
  template: 'schedulesDefault'
  subscriptions: -> Meteor.subscribe('schedules')
  data: -> {
    schedulesDefault: Meteor.users.find({})
    router: { viewUser: @params.idOrUsername }
  }
