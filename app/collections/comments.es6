Comments = new Mongo.Collection('comments');
Ground.Collection(Comments);

Schema.Comments = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  body: {
    type: String,
  },
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: Util.autoCreatedBy
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt,
    index: 1
  }
});

Meteor.startup(() => {
  Comments.attachSchema(Schema.Comments);
  Comments.attachBehaviour('softRemovable');
});
