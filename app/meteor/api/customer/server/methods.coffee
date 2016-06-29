{ Meteor } = require 'meteor/meteor'

module.exports = ->
  Meteor.methods
    'customer/get': ->
      customer = {}
      customer.name = process.env.CUSTOMER_NAME

      console.warn('Please set environment variable CUSTOMER_NAME') unless customer.name

      return customer
