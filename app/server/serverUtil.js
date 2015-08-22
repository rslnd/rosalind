Meteor.methods({
  'isTesting': function() {
    return  (process.env.IS_MIRROR && process.env.NODE_ENV === 'development');
  }
});
