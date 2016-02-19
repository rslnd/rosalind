Template.stamp.helpers
  show: ->
    @doc? and @field? and @doc[@field + 'By']? and @doc[@field + 'At']?

  fieldBy: ->
    @doc[@field + 'By']

  fieldAt: ->
    @doc[@field + 'At']

  verb: ->
    TAPi18n.__ @doc.collection()._name + '.' + @field + 'By'

  name: ->
    user = Meteor.users.findOne(@doc[@field + 'By'])
    Helpers.getFirstName(user)
