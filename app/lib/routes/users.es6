Router.route('/users');
Router.route('/users/:_id/edit', {
  template: 'editUser',
  data() { return Meteor.users.findOne(this.params._id); }

});

Router.route('/users/new', function() {
  this.render('newUser');
});
