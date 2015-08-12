var Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {

  this.route('/inboundCalls', {
    waitOn() { return Subs.subscribe('inboundCalls'); },
    data()   { return { inboundCalls: InboundCalls.find({}) }; }
  });

  this.route('/inboundCalls/new', function() {
    this.render('newInboundCall');
  });

  this.route('/', function() {
    this.render('dashboard');
  });

});
