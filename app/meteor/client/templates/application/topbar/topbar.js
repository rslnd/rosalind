Template.topbar.events({
  'click .logout'() {
    Meteor.logout();
    Router.go('/');
  }
});
