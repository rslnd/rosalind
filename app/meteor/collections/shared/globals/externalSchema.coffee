@Schema ||= {}

Schema.ExternalTimestamps = new SimpleSchema
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

Schema.ExternalNode = new SimpleSchema
  timestamps:
    type: Schema.ExternalTimestamps
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

Schema.External = new SimpleSchema
  eoswin:
    optional: true
    type: Schema.ExternalNode

  terminiko:
    optional: true
    type: Schema.ExternalNode
