import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export default new SimpleSchema({
  name: {
    type: String
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
  }
})
