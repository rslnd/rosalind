Router.route('/users')
Router.route '/users/:_id/edit',
  template: 'editUser'
  data: -> Meteor.users.findOne(@params._id)

Router.route '/users/new', ->
  @render('newUser')
