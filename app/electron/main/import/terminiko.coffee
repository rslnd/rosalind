logger = require '../logger'
settings = require '../settings'
uploadStream = require '../uploadStream'
{ ipcMain } = require 'electron'

module.exports =
  start: ->
    return unless settings.import.terminiko.enabled
    logger.info('[Import] Terminiko: Enabled', settings.import.terminiko.path)

    ipcMain.on('import/terminiko', @import)

  import: ->
    unless settings.import.terminiko.enabled
      return logger.error('[Import] Terminiko: Disabled')

    logger.info('[Import] Terminiko: Uploading', settings.import.terminiko.path)
    uploadStream.upload(settings.import.terminiko.path, importer: 'terminiko')
