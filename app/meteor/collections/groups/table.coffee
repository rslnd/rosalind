TabularTables.Groups = new Tabular.Table
  name: 'Groups'
  collection: Groups
  columns: [
    { data: 'order', tmpl: Meteor.isClient and Template.groupIcon }
    { data: 'name', title: 'Name' }
    { data: 'usersCount()', title: 'Benutzer' }
    { tmpl: Meteor.isClient and Template.editLink }
  ]
  order: [[0, 'asc']]
  extraFields: ['color', 'icon']
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
