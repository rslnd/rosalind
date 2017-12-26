import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const schema = new SimpleSchema({
  name: {
    type: String
  },

  slug: {
    type: String
  }
})
