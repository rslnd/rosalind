import map from 'lodash/map'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'
import Time from '../../util/time'
import { External } from '../../util/schema/external'
import { Day } from '../../util/schema/day'

module.exports = new SimpleSchema
  type:
    type: String
    allowedValues: [
      'default'
      'override'
      'constraint'
      'businessHours'
      'businessHoursOverride'
      'holidays'
      'day'
      'note'
    ]
    index: 1

  reason:
    type: String
    optional: true
    allowedValues: [
      'vacation'
      'compensatory'
      'sick'
    ]

  userId:
    type: SimpleSchema.RegEx.Id,
    index: 1
    optional: true

  userIds:
    type: [SimpleSchema.RegEx.Id]
    index: 1
    optional: true

  note:
    type: String
    optional: true

  available:
    type: Boolean
    index: 1
    optional: true
    defaultValue: true

  start:
    type: Date
    optional: true

  end:
    type: Date
    optional: true

  day:
    type: Day
    optional: true
  
  calendarId:
    type: SimpleSchema.RegEx.Id,
    optional: true
    index: 1

  external:
    optional: true
    type: External

  schedule:
    type: Array
    maxCount: 7
    optional: true

  'schedule.$':
    type: Object

  'schedule.$.day':
    type: String
    autoform:
      options: map(Time.weekdays(), (v, k) -> { label: v.label, value: k })

  'schedule.$.shift':
    type: Array

  'schedule.$.shift.$':
    type: Object
    optional: true

  'schedule.$.shift.$.start.h':
    type: Number
    min: 0
    max: 23

  'schedule.$.shift.$.start.m':
    type: Number
    min: 0
    max: 59
    optional: true

  'schedule.$.shift.$.end.h':
    type: Number
    min: 0
    max: 23
  'schedule.$.shift.$.end.m':
    type: Number
    min: 0
    max: 59
    optional: true

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true

  valid:
    type: Boolean
    defaultValue: true

  requestedAt:
    type: Date
    index: 1
    optional: true

  requestedBy:
    type: SimpleSchema.RegEx.Id
    index: 1
    optional: true

  resolvedAt:
    type: Date
    index: 1
    optional: true

  resolvedBy:
    type: SimpleSchema.RegEx.Id
    optional: true

  approvedAt:
    type: Date
    optional: true

  approvedBy:
    type: SimpleSchema.RegEx.Id
    optional: true

  declinedAt:
    type: Date
    optional: true

  declinedBy:
    type: SimpleSchema.RegEx.Id
    optional: true
