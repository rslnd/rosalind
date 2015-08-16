userLoginSchema = new SimpleSchema({
  name: {
    type: String,
    label: 'Name'
  },
  password: {
    type: String,
    label: 'Password',
    min: 4
  }
});
