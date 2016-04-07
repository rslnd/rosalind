{ Groups } = require '/imports/api/groups'

Template.employeeSelect.helpers
  groups: ->
    Groups.methods.all()

  employees: ->
    @users()
