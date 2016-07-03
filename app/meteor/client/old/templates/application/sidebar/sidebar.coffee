{ browserHistory } = require 'react-router'

sidebar = [
  {} =
    name: 'inboundCalls'
    path: '/inboundCalls'
    icon: 'phone'
    countBadge: 'inboundCalls'
    roles: ['admin', 'inboundCalls']
    submenu: [
      { name: 'thisOpen', path: '/inboundCalls' }
      { name: 'thisResolved', path: '/inboundCalls/resolved' }
      { name: 'thisInsert', path: '/inboundCalls/new' }
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
      { name: 'thisImporters' }
      { name: 'thisJobs' }
      { name: 'thisTags' }
      { name: 'thisNative', disabled: -> not window.native }
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

  hrefLevel1: ->
    if @route
      @route
    else
      route = [@parent.name, @name].join('.')

  showNav: ->
    return true unless @roles
    return true if (@roles and Roles.userIsInRole(Meteor.user(), @roles))
    return false

Template.sidebar.events
  'click .treeview-menu': ->
    $('body').removeClass('sidebar-open')

  'click .level-0': ->
    browserHistory.push(@path)

  'click .level-1': ->
    browserHistory.push(@path)

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
