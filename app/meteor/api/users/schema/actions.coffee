{ SimpleSchema } = require 'meteor/aldeed:simple-schema'

Login = new SimpleSchema
  name:
    type: String

  password:
    type: String
    min: 2

Create = new SimpleSchema
  username:
    type: String

UpdatePassword = new SimpleSchema
  password:
    type: String

  userId:
    type: String


UpdateRoles = new SimpleSchema
  roles:
    type: String

  userId:
    type: String

Login.i18n('login.form')

module.exports = { Login, Create, UpdatePassword, UpdateRoles }
