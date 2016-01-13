Meteor.methods
  'authentication/getToken': ->
    user = Meteor.user()
    return unless user

    Winston.info('[Authentication] User requested token', { @userId })
    return user.lastToken()
