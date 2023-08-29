import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day, HM, External, Auto } from '../../util/schema'
import { weekdays } from '../../util/time/weekdays'

export const Schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: [
      'default',
      'override',
      'overlay',
      'businessHours',
      'businessHoursOverride',
      'holiday',
      'day'
    ],
    index: 1
  },

  reason: {
    type: String,
    optional: true,
    allowedValues: [
      'vacation',
      'compensatory',
      'sick'
    ]
  },

  userId: {
    type: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },

  userIds: {
    type: [SimpleSchema.RegEx.Id],
    index: 1,
    optional: true
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

  noteDetails: {
    type: String,
    optional: true
  },

  roles: {
    type: [String],
    optional: true
  },

  available: {
    type: Boolean,
    index: 1,
    optional: true,
    defaultValue: true
  },

  start: {
    type: Date,
    optional: true,
    index: 1
  },

  end: {
    type: Date,
    optional: true,
    index: 1
  },

  day: {
    type: Day,
    optional: true,
    index: 1
  },

  weekdays: {
    type: [String],
    optional: true,
    allowedValues: weekdays
  },

  weekday: {
    type: String,
    optional: true,
    allowedValues: weekdays
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

  external: {
    optional: true,
    type: External
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
  },

  valid: {
    type: Boolean,
    defaultValue: true
  },

  requestedAt: {
    type: Date,
    index: 1,
    optional: true
  },

  requestedBy: {
    type: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },

  resolvedAt: {
    type: Date,
    index: 1,
    optional: true
  },

  resolvedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  approvedAt: {
    type: Date,
    optional: true
  },

  approvedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  declinedAt: {
    type: Date,
    optional: true
  },

  declinedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  }
})
