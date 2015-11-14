/* global Groups: true */

Groups = new Mongo.Collection('groups');
Ground.Collection(Groups);

Schema.Groups = new SimpleSchema({
  name: {
    type: String
  },
  icon: {
    type: String,
    optional: true
  },
  color: {
    type: String,
    optional: true,
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
  return Groups.find({}, {sort: {order: 1}}).fetch();
};

TabularTables.Groups = new Tabular.Table({
  name: 'Groups',
  collection: Groups,
  columns: [
    {data: 'order', tmpl: Meteor.isClient && Template.groupIcon},
    {data: 'name', title: 'Name'},
    {data: 'usersCount()', title: 'Benutzer'},
    {tmpl: Meteor.isClient && Template.editLink }
  ],
  order: [[0, 'asc']],
  extraFields: ['color', 'icon'],
  allow: (userId) => {
    return Roles.userIsInRole(userId, ['admin']);
  }
});
