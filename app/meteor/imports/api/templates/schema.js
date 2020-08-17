import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const Schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['consent']
  },

  name: {
    type: String
  },

  localPath: {
    type: String
  },

  order: {
    type: Number,
    optional: true
  }
})
