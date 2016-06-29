{ Users } = require 'api/users'

Template.ranking.helpers
  assigneesWithIndex: ->
    @assignees.map (a, index) ->
      a.index = index + 1
      return a

  assignee: ->
    Users.findOne(@id)

  hasNewPatients: ->
    @patients.new and @patients.new > 0

  showRevenue: ->
    Template.reports.currentView.get('showRevenue')

Template.ranking.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()
