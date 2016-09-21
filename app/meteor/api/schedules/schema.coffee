map = require 'lodash/map'
{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
Auto = require 'util/schema/auto'
Time = require 'util/time'
{ External } = require 'util/schema/external'

module.exports = new SimpleSchema
  type:
    type: String
    allowedValues: [
      'default'
      'override'
      'businessHours'
      'businessHoursOverride'
      'holidays'
    ]
    index: 1

  userId:
    type: SimpleSchema.RegEx.Id,
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
    type: String
    autoValue: Auto.createdBy
    optional: true
