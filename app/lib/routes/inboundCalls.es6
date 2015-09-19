var Subs = new SubsManager();

Router.configure({
  subscriptions() { Subs.subscribe('inboundCalls'); }
});

Router.route('/inboundCalls', {
  subscriptions() { return Subs.subscribe('inboundCalls'); },
  data()   { return { inboundCalls: InboundCalls.find({}) }; }
});

Router.route('/inboundCalls/resolved', {
  subscriptions() { return Subs.subscribe('inboundCalls', {removed: true}); },
  data()   { return { inboundCalls: InboundCalls.find({removed: true}) }; }
});

Router.route('/inboundCalls/new', function() {
  this.render('newInboundCall');
});
