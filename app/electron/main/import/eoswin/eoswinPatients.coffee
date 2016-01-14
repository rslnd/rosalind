logger = require('../../logger')
settings = require('../../settings')
uploadStream = require('../../uploadStream')
ipc = require('electron').ipcMain

module.exports =
  start: ->
    return unless settings.import.eoswin.patients.enabled
    logger.info('[Import] EoswinPatients: Enabled', settings.import.eoswin.patients.path)

    ipc.on('import/eoswin/patients', @import)

  import: ->
    return unless settings.import.eoswin.patients.enabled

    logger.info('[Import] EoswinPatients: Uploading', settings.import.eoswin.patients.path)
    uploadStream.upload(settings.import.eoswin.patients.path, importer: 'eoswinPatients')
