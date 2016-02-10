Template.layout.onCreated ->
  @autorun =>
    @subscribe('users')
    @subscribe('groups')
    @subscribe('counts')
    @subscribe('inboundCalls')

Template.layout.helpers
  loaded: ->
    FlowRouter.subsReady()
  locale: ->
    TAPi18n.getLanguage()

UI.registerHelper 'activeClass', (context) ->
  FlowRouter.watchPathChange()
  { class: 'active' } if (context is FlowRouter.current().route.path())

UI.registerHelper 'time', (context, options) ->
  return unless context?
  format = if options.format then options.format else 'HH:mm'
  moment(context).format(format)

UI.registerHelper 'showCount', (context) ->
  return unless context?
  count = Counts.get(context)
  if (count > 0) then count else false

Template.registerHelper 'instance', ->
  Template.instance()
