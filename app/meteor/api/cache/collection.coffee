{ Mongo } = require 'meteor/mongo'

Cache = new Mongo.Collection('cache')

module.exports = Cache
