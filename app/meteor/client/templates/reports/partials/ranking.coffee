Template.ranking.helpers
  assigneesWithIndex: ->
    @assignees.map (a, index) ->
      a.index = index + 1
      return a

  assignee: ->
    Meteor.users.findOne(@id)
