logger = require('../logger')
settings = require('../settings')
Xdt = require('xdt')

module.exports =
  watch: (options) ->
    return unless settings.import.bdt.enabled
    return unless settings.import.bdt.watch

    logger.info('[Import] Bdt: Watching', settings.import.bdt.path)

    @bdt = new Xdt().watch settings.import.bdt.path, delete: settings.import.bdt.delete, (err, doc) ->
      return logger.error('[Import] Bdt: Error', err) if err?
      logger.info('[Import] Bdt: Received', doc.patient)
      options.ipcReceiver.webContents.send('bdt', doc.patient)

  close: ->
    @bdt.watcher.close()
