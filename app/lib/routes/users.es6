Router.route('/users', {
  waitOn() { return Meteor.subscribe('users'); },
  data()   { return { users: Meteor.users.find({}) }; }
});

Router.route('/users/new', function() {
  this.render('newUser');
});
