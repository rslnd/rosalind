import factory from './fixtures/factory'
import users from './fixtures/users'

module.exports = ->
  @Given 'this user belongs to the group \'$groupName\'', (groupName) ->
    users.assignLastCreatedUserToGroup(groupName)

  @Given /^an? '([^']*)' with the following attributes:?$/, (collection, attributes) ->
    if collection.match(/^Users?$/i)
      method = users.create
    else
      method = factory.insert

    attributes.hashes().forEach (row) ->
      method
        collection: collection
        attributes: row
