Subs = new SubsManager()

Router.configure
  subscriptions: -> Subs.subscribe('inboundCalls')

Router.route '/inboundCalls',
  subscriptions: -> Subs.subscribe('inboundCalls')
  data: -> { inboundCalls: InboundCalls.find({}) }

Router.route '/inboundCalls/resolved',
  subscriptions: -> Subs.subscribe('inboundCalls', { removed: true })
  data: -> { inboundCalls: InboundCalls.find({}, { removed: true }) }

Router.route '/inboundCalls/new', ->
  @render('newInboundCall')
