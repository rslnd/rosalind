{ Mongo } = require 'meteor/mongo'

Cache = new Mongo.Collection('Cache')

module.exports = Cache
