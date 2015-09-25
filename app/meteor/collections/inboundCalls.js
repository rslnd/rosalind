/* global InboundCalls: true */

InboundCalls = new Mongo.Collection('inboundCalls');
Ground.Collection(InboundCalls);

Schema.InboundCalls = new SimpleSchema({
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
    optional: true,
    index: -1
  },
  createdBy: {
    type: String,
    autoValue: Util.autoCreatedBy,
    optional: true
  }
});

InboundCalls.helpers({
  privateOrInsurance: function() {
    return this.privatePatient ? TAPi18n.__('inboundCalls.private') : TAPi18n.__('inboundCalls.insurance');
  },
  unresolve: function() {
    return Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>');
  }
});

InboundCalls.helpers({
  collectionSlug() {
    return 'inboundCalls';
  }
});

TabularTables.InboundCalls = new Tabular.Table({
  name: 'ResolvedInboundCalls',
  collection: InboundCalls,
  columns: [
    {data: 'firstName', title: 'Vorname'},
    {data: 'lastName', title: 'Nachname'},
    {data: 'telephone', title: 'Telefon', render(val) { return Helpers.zerofix(val); }},
    {data: 'note', title: 'Notiz'},
    {data: 'privatePatient', title: 'Privat', render(val, type, doc) { return doc.privateOrInsurance(); }},
    {data: 'createdAt', title: 'Angenommen', render(val) { return moment(val).calendar(); }},
    {data: 'createdBy', title: 'von', render(val) { return Helpers.getFirstName(val); }},
    {data: 'removedAt', title: 'Erledigt', render(val) { return moment(val).calendar(); }},
    {data: 'removedBy', title: 'von', render(val) { return Helpers.getFirstName(val); }},
    {title: '<i class="fa fa-commenting-o"></i>', tmpl: Meteor.isClient && Template.commentCount },
    {tmpl: Meteor.isClient && Template.inboundCallsUnresolve }
  ],
  order: [[5, 'desc'], [7, 'desc']],
  sub: new SubsManager(),
  changeSelector: (selector) => {
    selector.removed = true;
    return selector;
  }
});

Meteor.startup(() => {
  Schema.InboundCalls.i18n('inboundCalls.form');
  InboundCalls.attachSchema(Schema.InboundCalls);
  InboundCalls.attachBehaviour('softRemovable');
});
