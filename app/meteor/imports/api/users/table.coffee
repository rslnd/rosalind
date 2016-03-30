TabularTables.Users = new Tabular.Table
  name: 'Users',
  collection: Meteor.users
  columns: [
    { data: 'status', tmpl: Meteor.isClient and Template.status }
    { data: 'profile.lastName', title: 'Name', render: (val, type, doc) -> doc.fullNameWithTitle() }
    { data: 'getRoles()', title: 'Berechtigungen' }
    { data: 'group()', title: 'Gruppe' }
    { data: 'lastActivity()', title: 'Zuletzt gesehen' }
    { data: '_id', render: (val) -> '<a href="/users/' + val + '/edit">Bearbeiten</a>' }
  ],
  order: [[0, 'asc'], [2, 'asc']]
  extraFields: ['profile', 'username', 'groupId']
  stateSave: true
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
