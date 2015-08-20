var Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.onBeforeAction(function (pause) {
  if (!Meteor.user()) {
    this.render('login');
  } else {
    Subs.subscribe('users');
    this.next();
  }
});

Router.route('/inboundCalls', {
  waitOn() { return Subs.subscribe('inboundCalls'); },
  data()   { return { inboundCalls: InboundCalls.find({}) }; }
});

Router.route('/inboundCalls/resolved', {
  waitOn() { return Meteor.subscribe('inboundCalls', {removed: true}); },
  data()   { return { inboundCalls: InboundCalls.find({removed: true}) }; }
});

Router.route('/inboundCalls/new', function() {
  this.render('newInboundCall');
});

Router.route('/', function() {
  this.render('dashboard');
});
