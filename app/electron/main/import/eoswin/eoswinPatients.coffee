logger = require('../../logger')
settings = require('../../settings')
uploadStream = require('../../uploadStream')
ipc = require('electron').ipcMain
path = require('path')

module.exports =
  start: ->
    return unless settings.import.eoswin.modules.patients

    logger.info('[Import] EoswinPatients: Enabled')

    ipc.on('import/eoswin/patients', @import)

  import: ->
    unless settings.import.eoswin.modules.patients
      return logger.error('[Import] EoswinPatients: Disabled')

    logger.info('[Import] EoswinPatients: Uploading', settings.import.eoswin.path)

    dataPath = path.join(settings.import.eoswin.path, 'DATEN', 'patient.ADT')
    uploadStream.upload(dataPath, importer: 'eoswinPatients')
