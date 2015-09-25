/* global Schema: true */

Schema = {};
if (Meteor.isClient)
  Template.registerHelper('Schema', Schema);
