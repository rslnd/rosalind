import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Auto, Day, External } from '../../util/schema'

module.exports = new SimpleSchema
  day:
    type: Day
    index: true
    unique: true

  total:
    type: Object
    blackbox: true
    optional: true

  assignees:
    type: [Object]
    blackbox: true
    optional: true

  average:
    type: Object
    blackbox: true
    optional: true

  external:
    optional: true
    type: External
  
  addenda:
    optional: true
    type: [Object]
    blackbox: true

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true
