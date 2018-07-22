import { SimpleSchema } from 'meteor/aldeed:simple-schema'

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

module.exports = { Login, Create, UpdatePassword, UpdateRoles }
