{ Meteor } = require 'meteor/meteor'

module.exports = ->
  if process.env.NODE_ENV is 'development' and Meteor.settings.test
    console.log('[Meteor] Running in environment: test')
