logger = require('./logger')
settings = require('./settings')
Xdt = require('xdt')

module.exports =
  watch: (options) ->
    logger.info('[Bdt] Watching', settings.bdt.watch)

    @bdt = new Xdt().watch settings.bdt.watch, delete: settings.bdt.delete, (err, doc) ->
      return logger.error('[Bdt] Error', err) if err?
      logger.info('[Bdt] Received', doc.patient)
      options.ipcReceiver.webContents.send('bdt', doc.patient)

  close: ->
    @bdt.watcher.close()
