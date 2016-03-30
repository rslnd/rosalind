{ Users } = require '/imports/api/users'

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
    if user = Users.findOne(@doc[@field + 'By'])
      user.firstName()
