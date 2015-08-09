InboundCalls = new Meteor.Collection('inboundCalls');

InboundCalls.allow({
  insert: function() { return true; }
});

InboundCalls.before.insert(function (id, doc) {
  doc.createdAt = Date.now();
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
    label: 'Date'
  }
}));
