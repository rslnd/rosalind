import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import helpersProfile from '../../util/helpersProfile'
import helpers from './helpers'
import methods from './methods'
import Schema from './schema/users'

Users = Meteor.users

Users.attachSchema(Schema)
Users.helpers(helpersProfile)
Users.helpers(helpers)
Users.helpers({ collection: -> Users })

Users.methods = methods(Users)

module.exports = Users
