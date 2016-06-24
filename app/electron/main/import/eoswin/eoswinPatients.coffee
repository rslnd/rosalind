path = require 'path'
{ ipcMain } = require 'electron'
logger = require '../../logger'
settings = require '../../settings'
uploadStream = require '../../uploadStream'

module.exports =
  start: ->
    return unless settings.import.eoswin.modules.patients

    logger.info('[Import] EoswinPatients: Enabled')

    ipcMain.on('import/eoswin/patients', @import)

  import: ->
    unless settings.import.eoswin.modules.patients
      return logger.error('[Import] EoswinPatients: Disabled')

    logger.info('[Import] EoswinPatients: Uploading', settings.import.eoswin.path)

    dataPath = path.join(settings.import.eoswin.path, 'DATEN', 'patient.ADT')
    uploadStream.upload(dataPath, importer: 'eoswinPatients')
