{ browserHistory } = require 'react-router'

Template.topbar.events
  'click .logout': ->
    Meteor.call 'users/logout', ->
      Meteor.logout()
      browserHistory.push('/')

  'click [rel="toggleSidebar"]': ->
    $('body').toggleClass('sidebar-collapse')
