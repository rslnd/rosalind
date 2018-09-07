import { Meteor } from 'meteor/meteor'
import * as methods from './methods'
import Schema from './schema/users'
import actions from './actions'

const Users = Meteor.users
Users.attachSchema(Schema)
Users.methods = methods
Users.actions = actions({ Users })

export default Users
