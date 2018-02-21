import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import * as methods from './methods'
import Schema from './schema/users'

Users = Meteor.users

Users.attachSchema(Schema)
Users.helpers(helpers)
Users.helpers({ collection: -> Users })

Users.methods = methods

module.exports = Users
