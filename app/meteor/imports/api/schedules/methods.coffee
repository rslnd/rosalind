assign = require 'lodash/assign'
isOpen = require './methods/isOpen'
isScheduled = require './methods/isScheduled'
miscMethods = require './methods/methods'

module.exports = (collection) ->
  methods = {}
  assign methods, [
    isOpen(collection)
    isScheduled(collection)
    miscMethods(collection)
  ]
  methods
