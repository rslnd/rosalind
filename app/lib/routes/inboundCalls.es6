var Subs = new SubsManager();

Router.configure({
  waitOn() { Subs.subscribe('inboundCalls'); }
});

Router.route('/inboundCalls', {
  waitOn() { return Subs.subscribe('inboundCalls'); },
  data()   { return { inboundCalls: InboundCalls.find({}) }; }
});

Router.route('/inboundCalls/resolved', {
  waitOn() { return Subs.subscribe('inboundCalls', {removed: true}); },
  data()   { return { inboundCalls: InboundCalls.find({removed: true}) }; }
});

Router.route('/inboundCalls/new', function() {
  this.render('newInboundCall');
});
