import React from 'react'
import once from 'lodash/once'
import Mousetrap from 'mousetrap'
import 'mousetrap/plugins/global-bind/mousetrap-global-bind'
import Alert from 'react-s-alert'
import { SpecialUnicorn } from '../../ui/components/Emoji'
import { Modal } from '../../ui/old/templates/application/modals/blazeModal'

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
      fn: ->
        if (Math.random() < 0.9)
          deg = Math.floor(40 + Math.random() * 280)
          document.body.style.filter = "hue-rotate(#{deg}deg) saturate(3) sepia(0.1)"
          setTimeout((-> document.body.style.filter = null), 3500)
        else
          Alert.info('', {
            timeout: 4500,
            customFields: {
              emoji: React.createElement(SpecialUnicorn, {}, null)
            }
          })
  ]


bindAll = once ->
  Mousetrap.bindGlobal 'esc', ->
    $(document.activeElement).blur()
    if window.hotkeyFlag
      window.__deprecated_history_go_back()

  Object.keys(hotkeys).forEach (group) ->
    hotkeys[group].forEach (hotkey) ->
      if hotkey.fn
        Mousetrap.bind(hotkey.key, hotkey.fn)
      else if hotkey.go
        Mousetrap.bind(hotkey.key, -> window.__deprecated_history_push(hotkey.go))


module.exports = ->
  bindAll()
  hotkeys
