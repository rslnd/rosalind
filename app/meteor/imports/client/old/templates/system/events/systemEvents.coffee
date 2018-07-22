import './systemEvents.tpl.jade'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../../../i18n'
import { Events } from '../../../../../api/events'
import { Users } from '../../../../../api/users'
import { subscribe } from '../../../../../util/meteor/subscribe'

Template.systemEvents.onCreated ->
  @autorun =>
    subscribe('events')

Template.systemEvents.helpers
  personName: ->
    Users.methods.fullNameWithTitle(Users.findOne(_id: @createdBy))

  title: (options = {}) ->
    if @subject
      options.subject = Users.methods.fullNameWithTitle(Users.findOne(_id: @subject))

    __('system.events.' + @type, options)

  relativeTime: ->
    moment(@createdAt).fromNow()

  time: ->
    moment(@createdAt).format('YYYY-MM-DD H:mm:ss')

  klass: ->
    levels =
      info: 'bg-aqua'
      warning: 'bg-yellow'
      error: 'bg-red'

    icons =
      users: 'fa-user'
      timesheets: 'fa-clock-o'

    level = levels[@level]
    icon = icons[@type.split('/')[0]]
    [level, icon].join(' ')

  events: ->
    Events.find {},
      limit: 200
      sort: { createdAt: -1 }

Template.systemEvents.events
  'click [rel="payload"]': ->
    if @payload
      Modal.show 'payloadModal',
        payload: @payload,
        title: 'Event Payload'
