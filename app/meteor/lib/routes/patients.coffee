Router.route('/patients')

Router.route '/patients/new', ->
  @render('newPatient')
