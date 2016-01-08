Router.route('/users')
Router.route '/users/:_id/edit',
  template: 'editUser'

Router.route '/users/new', ->
  @render('newUser')
