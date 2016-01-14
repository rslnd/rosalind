_ = require('lodash')
logger = require('./logger')
settings = require('./settings')
authentication = require('./authentication')
ipc = require('electron').ipcMain
fs = require('fs')
request = require('request')

module.exports =
  upload: (filePath, options) ->
    logger.info('[Import] Upload stream: Reading file')

    authentication.withToken (err, auth) ->
      return logger.error('[Import] Upload stream: Not authenticated', err) if err

      headers = {}
      headers['X-Importer'] = options.importer if options.importer?

      requestOptions =
        url: settings.url + '/api/upload/stream'
        headers: _.merge(auth.headers, headers)

      fs.createReadStream(filePath)
        .on 'error', (e) ->
          logger.error('[Import] Upload stream: Error reading file', e)
        .on 'end', ->
          logger.info('[Import] Upload stream: Done reading file')
        .pipe(request.post(requestOptions))
