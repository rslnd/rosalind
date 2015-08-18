var Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.onBeforeAction(function (pause) {
  if (!Meteor.user()) {
    this.render('login');
  } else {
    this.next();
  }
});

Router.route('/inboundCalls', {
  waitOn() { return Subs.subscribe('inboundCalls'); },
  data()   { return { inboundCalls: InboundCalls.find({}) }; }
});

Router.route('/inboundCalls/new', function() {
  this.render('newInboundCall');
});

Router.route('/', function() {
  this.render('dashboard');
});
