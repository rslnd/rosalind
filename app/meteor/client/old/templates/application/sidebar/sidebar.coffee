sidebar = [
  {} =
    name: 'appointments'
    icon: 'calendar'
    countBadge: 'appointments'
    roles: ['admin', 'appointments']
    submenu: [
      { name: 'thisOpen' }
      { name: 'thisAdmitted', route: '/appointments/:status', params: { status: 'admitted' } }
      { name: 'thisTreating', route: '/appointments/:status', params: { status: 'treating' } }
      { name: 'thisResolved' }
      { name: 'thisInsert' }
    ]

  {} =
    name: 'inboundCalls'
    icon: 'phone'
    countBadge: 'inboundCalls'
    roles: ['admin', 'inboundCalls']
    submenu: [
      { name: 'thisOpen' }
      { name: 'thisResolved' }
      { name: 'thisInsert' }
    ]

  {} =
    name: 'schedules'
    icon: 'user-md'
    roles: ['admin', 'schedules']
    submenu: [
      { name: 'thisDefault' }
      { name: 'override' }
      { name: 'businessHours' }
      { name: 'holidays' }
    ]

  {} =
    name: 'reports'
    icon: 'bar-chart'
    roles: ['admin', 'reports']
    submenu: [
      { name: 'dashboard' }
    ]

  {} =
    name: 'users'
    icon: 'unlock-alt'
    roles: ['admin']
    submenu: [
      { name: 'thisAll' }
      { name: 'thisInsert' }
    ]

  {} =
    name: 'system'
    icon: 'server'
    roles: ['admin']
    submenu: [
      { name: 'thisEvents' }
      { name: 'thisStats' }
      { name: 'thisJobs' }
      { name: 'thisTags' }
      { name: 'thisNative' } if window.native
    ]
]

sidebar = _.map sidebar, (m) ->
  m.submenu = _.map m.submenu, (s) ->
    s.parent = m
    return s
  return m

window.sidebar = sidebar

Template.sidebar.helpers
  sidebar: -> sidebar

  name: ->
    if @submenu
      TAPi18n.__(@name + '.this')
    else
      TAPi18n.__ [Template.parentData().name, @name].join('.')

  htmlId: ->
    if @parent
      text = TAPi18n.__(@parent.name + '.' + @name)
    else
      text = TAPi18n.__(@name + '.this')


    text.replace(/[^a-z]/ig, '-').toLowerCase()

  hrefLevel0: ->
    route = [@name, @submenu[0].name].join('.')
    FlowRouter.path(route)

  hrefLevel1: ->
    if @route
      FlowRouter.path(@route, @params)
    else
      route = [@parent.name, @name].join('.')
      FlowRouter.path(route)

  showNav: ->
    return true unless @roles
    return true if (@roles and Roles.userIsInRole(Meteor.user(), @roles))
    return false

Template.sidebar.events
  'click .treeview-menu': ->
    $('body').removeClass('sidebar-open')

  'click .level-0': ->
    route = [@name, @submenu[0].name].join('.')
    FlowRouter.go(FlowRouter.path(route))

  'click .level-1': ->
    if @route
      FlowRouter.go(@route, @params)
    else
      route = [@parent.name, @name].join('.')
      FlowRouter.go(FlowRouter.path(route))

  'click .sidebar li a': (e, t) ->
    $this = $(e.currentTarget)
    checkElement = $this.next()

    if checkElement.is('.treeview-menu') and checkElement.is(':visible')
      checkElement.slideUp 'normal', ->
        checkElement.removeClass('menu-open')

      checkElement.parent('li').removeClass('active')

    else if checkElement.is('.treeview-menu') and not checkElement.is(':visible')
      parent = $this.parents('ul').first()
      ul = parent.find('ul:visible').slideUp('normal')
      ul.removeClass('menu-open')

      parent_li = $this.parent('li')
      checkElement.slideDown 'normal', ->
        checkElement.addClass('menu-open')
        parent.find('li.active').removeClass('active')
        parent_li.addClass('active')

    if checkElement.is('.treeview-menu')
      e.preventDefault()
