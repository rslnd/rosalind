Template.topbar.events({
  'click .logout'() {
    Meteor.logout();
    FlowRouter.go('/');
  }
});
