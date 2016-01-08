Router.route '/inboundCalls'

Router.route '/inboundCalls/resolved'

Router.route '/inboundCalls/new', ->
  @render('newInboundCall')
