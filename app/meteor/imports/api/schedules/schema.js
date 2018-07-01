import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'
import { External } from '../../util/schema/external'
import { Day } from '../../util/schema/day'

export const HM = new SimpleSchema({
  h: { type: Number, min: 0, max: 23 },
  m: { type: Number, min: 0, max: 59 }
})

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const Schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: [
      'default',
      'override',
      'constraint',
      'businessHours',
      'businessHoursOverride',
      'holiday',
      'day',
      'note'
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

  note: {
    type: String,
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
    optional: true
  },

  end: {
    type: Date,
    optional: true
  },

  day: {
    type: Day,
    optional: true
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
