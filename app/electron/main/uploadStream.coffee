_ = require('lodash')
logger = require('./logger')
settings = require('./settings')
authentication = require('./authentication')
ipc = require('electron').ipcMain
fs = require('fs')
request = require('request')

uploadFile = (path, requestOptions) ->
  requestOptions.headers['X-Filename'] = path

  fs.createReadStream(path)
    .on 'error', (e) ->
      logger.error('[Import] Upload stream: Error reading file', e)
    .on 'end', ->
      logger.info('[Import] Upload stream: Done reading file')
    .pipe(request.post(requestOptions))

module.exports =
  upload: (filePaths, options) ->
    logger.info('[Import] Upload stream: Reading file')

    authentication.withToken (err, auth) ->
      return logger.error('[Import] Upload stream: Not authenticated', err) if err

      headers = {}
      headers['X-Importer'] = options.importer if options.importer

      requestOptions =
        url: settings.url + '/api/upload/stream'
        headers: _.merge(auth.headers, headers)

      if typeof filePaths is 'string'
        filePath = filePaths
        requestOptions.headers['X-Meta'] = JSON.stringify(options.meta) if options.meta
        uploadFile(filePath, requestOptions)

      else if typeof filePaths is 'object' and filePaths.length > 0
        filePaths.forEach (filePath) ->
          if typeof options.meta is 'function'
            requestOptions.headers['X-Meta'] = JSON.stringify(options.meta(filePath))
          uploadFile(filePath, requestOptions)
