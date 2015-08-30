Router.route('/users');

Router.route('/users/new', function() {
  this.render('newUser');
});
