module.exports =
  reset: ->
    server.execute ->
      console.log('[Fixtures] Cleaning database')

      if process.env.NODE_ENV isnt 'development'
        throw new Error '[Fixtures] resetDatabase is only allowed in development. Something has gone wrong.'
      else
        Package['xolvio:cleaner'].resetDatabase({ excludedCollections: ['events'] })
