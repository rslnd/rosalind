import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as methods from './methods'
import Schema from './schema/users'

Users = Meteor.users

Users.attachSchema(Schema)

Users.methods = methods

module.exports = Users
