@Reports = new Mongo.Collection('reports')

Meteor.startup ->
  Schema.Reports = new SimpleSchema

    day:
      type: Schema.Day
      index: true
      unique: true

    assignees:
      type: Object
      blackbox: true
      optional: true

    external:
      optional: true
      type: Schema.External

    createdAt:
      type: Date
      autoValue: Util.autoCreatedAt
      optional: true

  Reports.attachSchema(Schema.Reports)
