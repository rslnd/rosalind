Jobs = require '../collection'

module.exports = ->
  Object.keys(Jobs).forEach (job) ->

    Jobs[job].events.on 'error', (msg) ->
      return console.error("[Job] #{job}: Error", msg)

    Jobs[job].events.on 'jobLog', (msg) ->
      message = msg.params[2]
      return console.log("[Job] #{job}: " + message)
