import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { Roles } from 'meteor/alanning:roles'
import { Users } from '../users'
import Jobs from './collection'

module.exports = ->
  TabularJobCollections
    import:
      sub: new SubsManager()
      collection: Jobs.import
      allow: (userId) ->
        user = Users.findOne(userId)
        user and Roles.userIsInRole(user, 'admin')
