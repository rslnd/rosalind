import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const Log = new SimpleSchema({
  type: {
    type: String
  },

  date: {
    type: Date
  },

  userId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  payload: {
    type: Object,
    blackbox: true
  }
})
