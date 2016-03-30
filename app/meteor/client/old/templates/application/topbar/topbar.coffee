Template.topbar.events
  'click .logout': ->
    Meteor.call 'users/logout', ->
      Meteor.logout()
      FlowRouter.go('/')
