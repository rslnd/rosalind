_ = require('underscore')

module.exports = ->
  @Before ->
    server.call('fixtures/resetDatabase')

  @After ->
    server.call('fixtures/resetDatabase')

  @Given 'this user belongs to the group \'$groupName\'', (groupName) ->
    server.call('fixtures/assignLastCreatedUserToGroup', groupName)

  @Given /^an? '([^']*)' with the following attributes:?$/, (collection, attributes) ->
    if collection.match(/^Users?$/i)
      method = 'fixtures/users/create'
    else
      method = 'fixtures/createRecord'
    _.each attributes.hashes(), (row) =>
      @server.call method,
        collection: collection
        attributes: row
