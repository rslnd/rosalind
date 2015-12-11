sidebar = [
  {
    name: 'appointments.this'
    icon: 'calendar'
    countBadge: 'appointments'
    roles: ['admin', 'appointments']
    submenu: [
      { name: 'appointments.thisOpen', link: '/appointments' }
      { name: 'appointments.thisAdmitted', link: '/appointments/admitted' }
      { name: 'appointments.thisTreating', link: '/appointments/treating' }
      { name: 'appointments.thisResolved', link: '/appointments/resolved' }
      { name: 'appointments.thisInsert', link: '/appointments/new' }
    ]
  }
  {
    name: 'inboundCalls.this'
    icon: 'phone'
    countBadge: 'inboundCalls'
    roles: ['admin', 'inboundCalls']
    submenu: [
      { name: 'inboundCalls.thisOpen', link: '/inboundCalls' }
      { name: 'inboundCalls.thisResolved', link: '/inboundCalls/resolved' }
      { name: 'inboundCalls.thisInsert', link: '/inboundCalls/new' }
    ]
  }
  {
    name: 'patients.this'
    icon: 'users'
    roles: ['admin', 'patients']
    submenu: [
      { name: 'patients.thisAll', link: '/patients' }
    ]
  }
  {
    name: 'schedules.this'
    icon: 'user-md'
    roles: ['admin', 'schedules']
    submenu: [
      { name: 'schedules.thisDefault', link: '/schedules/default' }
    ]
  }
  {
    name: 'reports.this'
    icon: 'bar-chart'
    roles: ['admin', 'reports']
    submenu: [
      { name: 'reports.dashboard', link: '/reports' }
    ]
  }
  {
    name: 'users.this'
    icon: 'unlock-alt'
    roles: ['admin']
    submenu: [
      { name: 'users.thisAll', link: '/users' }
      { name: 'users.thisInsert', link: '/users/new' }
    ]
  }
]

Template.sidebar.helpers
  sidebar: -> sidebar
  toHtmlId: (name) -> TAPi18n.__(name).replace(/[^a-z]/ig, '-').toLowerCase()
  showNav: (roles) ->
    return true unless roles
    return true if (roles and Roles.userIsInRole(Meteor.user(), roles))
    return false

Template.sidebar.events
  'click .treeview-menu a': ->
    $('body').removeClass('sidebar-open')
