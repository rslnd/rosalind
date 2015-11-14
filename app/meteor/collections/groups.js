/* global Groups: true */

Groups = new Mongo.Collection('groups');
Ground.Collection(Groups);

Schema.Groups = new SimpleSchema({
  name: {
    type: String
  },
  order: {
    type: Number,
    optional: true
  }
});

Groups.attachSchema(Schema.Groups);

Groups.helpers({
  users() {
    return Meteor.users.find({groupId: this._id}).fetch();
  },
  usersCount() {
    return Meteor.users.find({groupId: this._id}).count();
  },
  collection() {
    return Groups;
  }
});

Groups.all = function() {
  return _.map(Groups.find({}).fetch(), (g) => {
    return { label: g.name, value: g._id };
  });
};

TabularTables.Groups = new Tabular.Table({
  name: 'Groups',
  collection: Groups,
  columns: [
    {data: 'order'},
    {data: 'name', title: 'Name'},
    {data: 'usersCount()', title: 'Benutzer'},
    {tmpl: Meteor.isClient && Template.editLink }
  ],
  order: [[0, 'asc']],
  allow: (userId) => {
    return Roles.userIsInRole(userId, ['admin']);
  }
});
