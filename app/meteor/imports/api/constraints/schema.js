import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { HM, Auto } from '../../util/schema'
import { weekdays } from '../../util/time/weekdays'

export const Schema = new SimpleSchema({
  assigneeIds: {
    type: [SimpleSchema.RegEx.Id],
    index: 1
  },

  tags: {
    type: [SimpleSchema.RegEx.Id],
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
