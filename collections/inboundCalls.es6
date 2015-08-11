InboundCalls = new Mongo.Collection('inboundCalls');

InboundCalls.allow({
  insert() { return true; },
  remove() { return true; }
});

InboundCalls.attachSchema(new SimpleSchema({
  firstName: {
    type: String,
    label: 'First name',
    optional: true
  },
  lastName: {
    type: String,
    label: 'Last name'
  },
  telephone: {
    type: String,
    label: 'Telephone',
  },
  note: {
    type: String,
    label: 'Note'
  },
  privatePatient: {
    type: Boolean,
    label: 'Private Patient'
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt
  }
}));
