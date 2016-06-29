{ SimpleSchema } = require 'meteor/aldeed:simple-schema'

Day = new SimpleSchema
  year:
    type: Number
    index: 1

  month:
    type: Number
    index: 1
    min: 1
    max: 12

  day:
    type: Number
    index: 1
    min: 1
    max: 31

  date:
    type: Date
    optional: true
    index: 1

module.exports = { Day }
