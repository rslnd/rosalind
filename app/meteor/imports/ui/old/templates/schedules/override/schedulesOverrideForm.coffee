import './schedulesOverrideForm.tpl.jade'
import $ from 'jquery'

Template.schedulesOverrideForm.events
  'change [rel="employeeSelect"]': (e) ->
    _id = $(e.target).find('option:selected').data('id')
    $('[rel="userIdTarget"]').val(_id)
