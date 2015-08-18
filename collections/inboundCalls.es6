InboundCalls = new Mongo.Collection('inboundCalls');

InboundCalls.allow({
  insert() { return true; },
  remove() { return true; }
});

var inboundCallsSchema = new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String
  },
  telephone: {
    type: String
  },
  note: {
    type: String
  },
  privatePatient: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt
  }
});

Meteor.startup(function() {
  inboundCallsSchema.i18n('inboundCalls.form');
  InboundCalls.attachSchema(inboundCallsSchema);
});
