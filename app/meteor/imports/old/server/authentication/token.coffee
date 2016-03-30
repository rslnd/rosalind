Meteor.methods
  'authentication/getToken': ->
    user = Meteor.user()
    return unless user

    console.log('[Authentication] User requested token', { @userId })
    return user.lastToken()
