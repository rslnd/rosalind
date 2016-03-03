logger = require('../../logger')
settings = require('../../settings')
uploadStream = require('../../uploadStream')
ipc = require('electron').ipcMain
glob = require('glob')
path = require('path')
Adt = require('node_adt')
naturalSort = require('javascript-natural-sort')

parseMeta = (metaPath, callback) ->
  meta = {}

  adt = new Adt()
  adt.open metaPath, 'ISO-8859-1', (err, table) ->
    logger.error('[Import] EoswinReports: ' + err) if err

    iterator = (err, record) ->
      logger.error('[Import] EoswinReports: ' + err) if err

      filename = record.DBFILE.slice(0, record.DBFILE.indexOf('.'))

      return unless record.VON is record.BIS
      return unless filename and filename.length > 0

      meta[filename] =
        day: record.VON
        id: filename

    table.eachRecord iterator, ->
      callback(meta)
      table.close()


module.exports =
  start: ->
    return unless settings.import.eoswin.modules.reports
    logger.info('[Import] EoswinReports: Enabled')
    ipc.on('import/eoswin/reports', (e, options) => @import(options))

  import: (options) ->
    return unless settings.import.eoswin.modules.reports

    metaPath = path.join(settings.import.eoswin.path, 'DATEN/DListen.ADT')
    dataPath = path.join(settings.import.eoswin.path, 'EOSWIN/DefList')

    parseMeta metaPath, (meta) ->

      getMeta = (key) ->
        key = path.basename(key)
        key = key.slice(0, key.indexOf('.'))
        meta[key]

      pattern = path.join(dataPath, 'ARZTSTAT*.adt')
      glob pattern, (err, files) ->
        if options.all
          logger.info("[Import] EoswinReports: Uploading all #{files.count} reports")
          uploadStream.upload(files, importer: 'eoswinReports', meta: (files) -> getMeta(files))

        else if files.length > 0
          files.sort(naturalSort)
          file = files[files.length - 1]
          logger.info("[Import] EoswinReports: Uploading latest report #{file}")
          uploadStream.upload(file, importer: 'eoswinReports', meta: getMeta(file))
