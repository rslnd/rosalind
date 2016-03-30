{ SimpleSchema } = require 'meteor/aldeed:simple-schema'

ExternalTimestamps = new SimpleSchema
  importedAt:
    type: Date
    optional: true

  importedBy:
    type: SimpleSchema.RegEx.Id
    optional: true

  externalUpdatedAt:
    type: Date
    optional: true

  externalUpdatedBy:
    type: String
    optional: true

ExternalNode = new SimpleSchema
  timestamps:
    type: ExternalTimestamps
    optional: true

  id:
    type: String
    index: 1

  payload:
    type: Object
    blackbox: true
    optional: true

  note:
    type: String
    optional: true

External = new SimpleSchema
  eoswin:
    optional: true
    type: ExternalNode

  terminiko:
    optional: true
    type: ExternalNode

module.exports = { External }
