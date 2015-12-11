Router.route('/patients')

Router.route '/patients/:_id/',
  template: 'patient'
  data: -> Meteor.users.findOne(@params._id)

Router.route '/patients/new', ->
  @render('newPatient')
