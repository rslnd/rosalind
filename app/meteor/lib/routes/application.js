var Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.onBeforeAction(function () {
  Session.set('loaded', false);
  if (!Meteor.user()) {
    this.render('login');
  } else {
    Subs.subscribe('users');
    Subs.subscribe('groups');
    Subs.subscribe('counts');

    this.next();
  }
});

Router.onAfterAction(function () {
  Session.set('loaded', true);
});

Router.onAfterAction(function() {
  if (!(
    window.location.hash === '' ||
    window.location.hash === '#' ||
    window.location.hash === '#!') && !Meteor.userId()) {
    this.render('login');
  }
});

Router.route('/', function() {
  this.render('dashboard');
});
