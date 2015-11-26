Subs = new SubsManager()

Router.configure
  subscriptions: -> Subs.subscribe('inboundCalls')

Router.route '/inboundCalls',
  data: -> { inboundCalls: InboundCalls.find({}) }

Router.route '/inboundCalls/resolved'

Router.route '/inboundCalls/new', ->
  @render('newInboundCall')
