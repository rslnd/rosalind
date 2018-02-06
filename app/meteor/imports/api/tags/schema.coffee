import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

module.exports = new SimpleSchema
  tag:
    type: String
    index: 1

  order:
    type: Number
    optional: true

  duration:
    type: Number
    optional: true

  description:
    type: String
    optional: true

  color:
    type: String
    optional: true

  privateAppointment:
    type: Boolean,
    optional: true

  defaultRevenue:
    type: Number,
    optional: true

  calendarId:
    type: SimpleSchema.RegEx.Id
    optional: true

  assigneeIds:
    type: [SimpleSchema.RegEx.Id]
    optional: true

  blacklistAssigneeIds:
    type: [SimpleSchema.RegEx.Id]
    optional: true

  reportAs:
    type: String
    optional: true

  reportHeader:
    type: String
    optional: true
  
  referrableFrom:
    type: [SimpleSchema.RegEx.Id],
    optional: true

  external:
    type: [ String ]
    optional: true
    index: 1

  createdBy:
    type: String
    regEx: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    index: 1
    optional: true
