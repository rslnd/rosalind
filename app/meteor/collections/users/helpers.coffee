Helpers.profile(Meteor.users)

Meteor.users.helpers
  lastActivity: ->
    if (@status and @status.lastActivity)
      TAPi18n.__('ui.status.lastActivity') + ' ' + moment(@status.lastActivity).fromNow()
    else if (@status and @status.online)
      TAPi18n.__('ui.status.online')
    else if (@status and @status.lastLogin and @status.lastLogin.date)
      TAPi18n.__('ui.status.lastLogin') + ' ' + moment(@status.lastLogin.date).fromNow()
    else
      TAPi18n.__('ui.status.never')

  shortname: ->
    if (@username.length <= 3)
      @username
    else
      _.map(@fullName().split(' '), (n) -> n.charAt(0) ).join('')

  group: ->
    group = Groups.findOne(@groupId)
    if (group)
      group.name

  getRoles: ->
    Roles.getRolesForUser(@_id).join(', ')

  lastToken: ->
    _(@services?.resume?.loginTokens).last()?.hashedToken

  collection: ->
    Meteor.users
