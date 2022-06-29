import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day, External, File } from '../../util/schema'

export const checkups = new SimpleSchema({
  day: {
    type: Day,
    index: 1
  },

  file: {
    type: File,
    optional: true
  },

  createdAt: {
    type: Date,
    index: 1
  },

  createdBy: {
    type: String
  }
})

export const checkupsRules = new SimpleSchema({
  rrule: {
    type: String
  },

  text: {
    type: String
  },

  name: {
    type: String,
  },

  createdAt: {
    type: Date,
    index: -1
  },

  createdBy: {
    type: String,
  },

  removedAt: {
    type: Date,
    index: -1,
    optional: true
  },

  removedBy: {
    type: String,
    optional: true
  },

  removed: {
    type: Boolean,
    optional: true,
    index: 1
  }
})
