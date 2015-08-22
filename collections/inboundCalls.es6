InboundCalls = new Mongo.Collection('inboundCalls');

InboundCalls.allow({
  insert() { return true; },
  update() { return true; }
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
    type: String,
    optional: true
  },
  note: {
    type: String
  },
  privatePatient: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt,
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: Util.autoCreatedBy,
    optional: true
  }
});

Meteor.startup(function() {
  inboundCallsSchema.i18n('inboundCalls.form');
  InboundCalls.attachSchema(inboundCallsSchema);
  InboundCalls.attachBehaviour('softRemovable');
});
