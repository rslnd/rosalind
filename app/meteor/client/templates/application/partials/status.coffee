Template.status.helpers
  userStatus: (user) ->
    if (typeof user is 'string')
      user = Meteor.users.findOne(user)

    if (typeof user is 'object' and user.doc)
      user = user.doc

    if (typeof user is 'object' and user.status)
      if user.status.online
        if user.status.idle then 'text-yellow' else 'text-green'
      else
        'text-muted'

  userPopoverTitle: (user) ->
    user?.status?.lastLogin?.ipAddr;

  userPopoverContent: (user) ->
    user?.status?.lastLogin?.userAgent;

Template.status.rendered = ->
  $('[data-toggle="popover"]').popover()
