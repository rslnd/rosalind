hotkeys =
  appointments: [
    {} =
      key: 't e'
      name: 'appointments'
      go: '/appointments'

    {} =
      key: 'n t'
      name: 'newAppointment'
      go: '/appointments/new'

    {} =
      key: 'e t'
      name: 'appointmentsResolved'
      go: '/appointments/resolved'
  ]

  inboundCalls: [
    {} =
      key: 'a n'
      name: 'inboundCalls'
      go: '/inboundCalls'

    {} =
      key: 'e a'
      name: 'inboundCallsResolved'
      go: '/inboundCalls/resolved'

    {} =
      key: 'n a'
      name: 'newInboundCall'
      go: '/inboundCalls/new'
  ]

  general: [
    {} =
      key: 'b e'
      name: 'reports'
      go: '/reports'

    {} =
      key: 'h'
      name: 'hotkeys'
      fn: -> Modal.show('hotkeys')

    {} =
      hidden: true
      key: [
        'up up down down left right left right b a enter',
        'u n i c o r n',
      ]
      fn: -> sAlert.success('Hello, Unicorn!')
  ]


Meteor.startup ->
  Mousetrap.bindGlobal 'esc', ->
    $(document.activeElement).blur()
    if window.hotkeyFlag
      history.back()

  Object.keys(hotkeys).forEach (group) ->
    hotkeys[group].forEach (hotkey) ->
      if hotkey.fn
        Mousetrap.bind(hotkey.key, hotkey.fn)
      else if hotkey.go
        Mousetrap.bind(hotkey.key, -> FlowRouter.go(hotkey.go))

Template.hotkeys.helpers
  hotkeys: ->
    hotkeys[@]

  groups: ->
    Object.keys(hotkeys)

  keys: ->
    if typeof @key is 'object'
      @key
    else
      @key.split(' ')

  hotkeyName: ->
    TAPi18n.__('hotkeys.' + @name)
