Template.topbar.events
  'click .logout': ->
    Meteor.call 'users/logout', ->
      Meteor.logout()
      FlowRouter.go('/')

  'click [rel="toggleSidebar"]': ->
    $('body').toggleClass('sidebar-collapse')
