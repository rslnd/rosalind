Meteor.methods
  'isTesting': ->
    (process.env.IS_MIRROR and process.env.NODE_ENV is 'development')
