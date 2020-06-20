import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { HM, Auto } from '../../util/schema'
import { weekdays } from '../../util/time/weekdays'

// Allows overriding certain fields of a tag as part of a constraint
const Tag = new SimpleSchema({
  tagId: {
    type: String
  },

  duration: {
    type: Number,
    optional: true
  },

  defaultRevenue: {
    type: Number,
    optional: true
  },

  note: {
    type: String,
    optional: true
  }
})

// Determines how appointment duration is calculated when multiple tags are selected
const DurationStrategy = new SimpleSchema({
  name: {
    type: String,
    allowedValues: ['max', 'add', 'addUpTo']
  },

  upTo: {
    type: Number,
    optional: true
  }
})

export const Schema = new SimpleSchema({
  assigneeIds: {
    type: [SimpleSchema.RegEx.Id],
    index: 1
  },

  order: {
    type: Number,
    optional: true
  },

  tags: {
    type: [Tag],
    index: 1,
    optional: true
  },

  note: {
    type: String,
    optional: true
  },

  weekdays: {
    type: [String],
    optional: true,
    allowedValues: weekdays
  },

  duration: {
    type: Number,
    optional: true
  },

  from: {
    type: HM,
    optional: true
  },

  to: {
    type: HM,
    optional: true
  },

  validFrom: {
    type: Date,
    optional: true
  },

  validTo: {
    type: Date,
    optional: true
  },

  durationStrategy: {
    type: DurationStrategy,
    optional: true
  },

  calendarId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true
  },

  createdBy: {
    type: SimpleSchema.RegEx.Id,
    autoValue: Auto.createdBy,
    optional: true
  }
})
