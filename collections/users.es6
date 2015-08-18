userLoginSchema = new SimpleSchema({
  name: {
    type: String,
  },
  password: {
    type: String,
    min: 4
  }
});

Meteor.startup(function() {
  userLoginSchema.i18n('login.form');
});
