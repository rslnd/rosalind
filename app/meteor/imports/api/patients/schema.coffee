import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Profile, External, Auto } from '../../util/schema'

module.exports = new SimpleSchema
  insuranceId:
    type: String
    optional: true
    unique: true
    index: 1

  note:
    type: String
    optional: true

  externalRevenue:
    type: Number
    decimal: true
    optional: true

  profile:
    type: Profile
    optional: true

  external:
    optional: true
    type: External

  patientSince:
    type: Date,
    optional: true

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true

  removed:
    type: Boolean
    optional: true
    index: 1
