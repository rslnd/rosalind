import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export default new SimpleSchema({
  name: {
    type: String
  },

  order: {
    type: Number,
    optional: true
  },

  icon: {
    type: String,
    optional: true
  },

  color: {
    type: String,
    optional: true
  },

  order: {
    type: Number,
    optional: true
  },

  baseRoles: {
    type: [String],
    optional: true
  }
})
