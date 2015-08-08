InboundCalls = new Meteor.Collection('inboundCalls');

InboundCalls.allow({
  insert: function() { return true; }
});

InboundCalls.attachSchema(new SimpleSchema({
  first_name: {
    type: String,
    label: 'First name',
    optional: true
  },
  last_name: {
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
  private_patient: {
    type: Boolean,
    label: 'Private Patient'
  },
}));
