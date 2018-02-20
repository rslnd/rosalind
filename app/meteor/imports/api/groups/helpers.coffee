import { Meteor } from 'meteor/meteor'
import { Users } from '../../api/users'

module.exports =
  users: (selector = {}) ->
    selector.groupId = @_id
    users = Users.find selector,
      sort: { lastName: 1 }

    users.fetch()

  usersCount: ->
    Users.find(groupId: @_id).count()
