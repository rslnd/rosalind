var Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn() { Subs.subscribe('counts'); }
});

Router.onBeforeAction(function () {
  Session.set('loaded', false);
  if (!Meteor.user()) {
    this.render('login');
  } else {
    Subs.subscribe('users');
    this.next();
  }
});

Router.onAfterAction(function () {
  Session.set('loaded', true);
});

Router.onAfterAction(function() {
  if (!(
    window.location.hash == ''
    || window.location.hash == '#'
    || window.location.hash == '#!') && !Meteor.userId()) {
    this.render('login')
  }
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

Router.route('/', function() {
  this.render('dashboard');
});
