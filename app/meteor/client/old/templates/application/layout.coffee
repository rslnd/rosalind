@AdminLTEOptions =
  sidebarExpandOnHover: true
  navbarMenuSlimscroll: true
  sidebarSlimScroll: true

Template.layout.screenSizes =
  xs: 480
  sm: 768
  md: 992
  lg: 1200

@Customer = new ReactiveDict

Template.layout.onCreated ->
  $('body').addClass('skin-blue fixed sidebar-mini sidebar-open')

  Meteor.call 'customer/get', (e, customer) ->
    console.error(e) if e
    @Customer.set('name', customer.name)
    document.title = customer.name

  @autorun =>
    @subscribe('users')
    @subscribe('cache')
    @subscribe('groups')
    @subscribe('tags')
    @subscribe('schedules')
    @subscribe('timesheets')
    @subscribe('inboundCalls')

Template.layout.events
  'click .content-wrapper': (e, t) ->
    if $(window).width() <= (Template.layout.screenSizes.sm - 1) and $('body').hasClass('sidebar-open')
      $('body').removeClass('sidebar-open')

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
