logger = require('../logger')
settings = require('../settings')
uploadStream = require('../uploadStream')
ipc = require('electron').ipcMain

module.exports =
  start: ->
    return unless settings.import.terminiko.enabled
    logger.info('[Import] Terminiko: Enabled', settings.import.terminiko.path)

    ipc.on('import/terminiko', @import)

  import: ->
    return unless settings.import.terminiko.enabled

    logger.info('[Import] Terminiko: Uploading', settings.import.terminiko.path)
    uploadStream.upload(settings.import.terminiko.path, importer: 'terminiko')
