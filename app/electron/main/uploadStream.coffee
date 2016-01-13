logger = require('./logger')
settings = require('./settings')
authentication = require('./authentication')
ipc = require('electron').ipcMain
fs = require('fs')
request = require('request')

module.exports =
  initialize: (options) ->
    return unless settings?.import?.uploadStream
    ipc.on 'import/uploadStream', (e) =>
      @import(e, options)

  upload: (filePath) ->
    logger.info('[Import] Upload stream: Reading file')

    authentication.withToken (err, auth) ->
      return logger.error('[Import] Upload stream: Not authenticated', err) if err

      requestOptions =
        url: settings.url + '/api/upload/stream'
        headers: auth.headers

      fs.createReadStream(filePath)
        .pipe(request.put(requestOptions))
        .on 'error', ->
          logger.error('[Import] Upload stream: Error reading file')
        .on 'end', ->
          logger.info('[Import] Upload stream: Done reading file')
