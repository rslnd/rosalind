TabularTables.Tags = new Tabular.Table
  name: 'Tags'
  collection: Tags
  columns: [
    { data: 'tag', title: 'Tag' }
    { data: 'description', title: 'Description' }
    { data: 'color', title: 'Color' }
    { tmpl: Meteor.isClient and Template.editLink }
  ]
  order: [[0, 'asc']]
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
