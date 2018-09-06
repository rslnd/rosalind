import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Login = new SimpleSchema({
  name: {
    type: String
  },

  password: {
    type: String,
    min: 2
  }
})

const Create = new SimpleSchema({
  username: {
    type: String
  }
})

const UpdatePassword = new SimpleSchema({
  password: {
    type: String
  },

  userId: {
    type: String
  }
})

const UpdateRoles = new SimpleSchema({
  roles: {
    type: [String]
  },

  userId: {
    type: String
  }
})

export { Login, Create, UpdatePassword, UpdateRoles }
