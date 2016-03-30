Template.systemEvents.onCreated ->
  @autorun =>
    @subscribe('events')

Template.systemEvents.helpers
  personName: ->
    Meteor.users.findOne(_id: @createdBy).fullNameWithTitle()

  title: (options = {}) ->
    if @subject
      options.subject = Meteor.users.findOne(_id: @subject).fullNameWithTitle()

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
