Comments = new Mongo.Collection('comments');
Ground.Collection(Comments);

Schema.Comments = new SimpleSchema({
  documentId: {
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
    autoValue: Util.autoCreatedBy,
    autoform: {
      options() {
        return _.map(Meteor.users.find({}).fetch(), (user) => {
          return {
            label: user.fullName(),
            value: user._id
          }
        });
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt,
    index: 1
  }
});
