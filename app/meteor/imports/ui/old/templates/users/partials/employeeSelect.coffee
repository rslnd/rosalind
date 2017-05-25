import { Groups } from 'api/groups'

Template.employeeSelect.helpers
  groups: ->
    Groups.methods.all()

  employees: ->
    @users()
