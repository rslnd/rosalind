@Tags = new Mongo.Collection('tags')
Ground.Collection(Tags)

Schema.Tags = new SimpleSchema
  tag:
    type: String
    unique: true
    index: 1

  description:
    type: String
    optional: true

  color:
    type: String
    optional: true

  external:
    type: [String]
    optional: true
    index: 1

  createdBy:
    type: String
    regEx: SimpleSchema.RegEx.Id
    autoValue: Util.autoCreatedBy
    optional: true

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    index: 1
    optional: true

Meteor.startup ->
  Tags.attachSchema(Schema.Tags)
  Tags.attachBehaviour('softRemovable')
