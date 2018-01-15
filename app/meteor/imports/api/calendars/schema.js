import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const schema = new SimpleSchema({
  order: {
    type: Number,
    optional: true
  },

  name: {
    type: String
  },

  color: {
    type: String
  },

  slug: {
    type: String
  },

  icon: {
    type: String
  },

  defaultDuration: {
    type: Number,
    defaultValue: 5
  },

  slotSize: {
    type: Number,
    defaultValue: 5
  },

  privateAppointments: {
    type: Boolean,
    optional: true
  }
})
