Template.layout.onCreated ->
  @autorun =>
    @subscribe('users')
    @subscribe('groups')
    @subscribe('counts')
    @subscribe('inboundCalls')

UI.registerHelper 'loaded', ->
  Session.get('loaded')

UI.registerHelper 'activeClass', (context) ->
  { class: 'active' } if (context is Router.current().route.path())

UI.registerHelper 'time', (context, options) ->
  return unless context?
  format = if options.format then options.format else 'HH:mm'
  moment(context).format(format)

UI.registerHelper 'showCount', (context) ->
  return unless context?
  count = Counts.get(context)
  if (count > 0) then count else false
