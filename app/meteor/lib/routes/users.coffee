users = FlowRouter.group
  prefix: '/users'

users.route '/',
  name: 'users.thisAll'
  action: ->
    BlazeLayout.render('layout', main: 'users')

users.route '/new',
  name: 'users.thisInsert'
  action: ->
    BlazeLayout.render('layout', main: 'newUser')

users.route '/:_id/edit',
  name: 'users.thisEdit'
  action: ->
    BlazeLayout.render('layout', main: 'editUser')
