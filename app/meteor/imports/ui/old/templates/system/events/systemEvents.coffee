import './systemEvents.tpl.jade'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Events } from '../../../../../api/events'
import { Users } from '../../../../../api/users'

Template.systemEvents.onCreated ->
  @autorun =>
    @subscribe('events')

Template.systemEvents.helpers
  personName: ->
    Users.findOne(_id: @createdBy).fullNameWithTitle()

  title: (options = {}) ->
    if @subject
      options.subject = Users.findOne(_id: @subject).fullNameWithTitle()

    TAPi18n.__('system.events.' + @type, options)

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
