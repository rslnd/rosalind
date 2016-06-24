glob = require 'glob'
path = require 'path'
naturalSort = require 'javascript-natural-sort'
Adt = require 'node_adt'
logger = require '../../logger'
settings = require '../../settings'
uploadStream = require '../../uploadStream'
{ ipcMain } = require 'electron'

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

    table.eachRecord iterator, done = ->
      logger.info("[Import] EoswinReports: Parsed #{Object.keys(meta).length} meta keys")
      callback(meta)
      table.close()


module.exports =
  start: ->
    return unless settings.import.eoswin.modules.reports
    logger.info('[Import] EoswinReports: Enabled')
    ipcMain.on('import/eoswin/reports', (e, options) => @import(options))

  import: (options = {}) ->
    unless settings.import.eoswin.modules.reports
      return logger.error('[Import] EoswinReports: Disabled')


    metaPath = path.join(settings.import.eoswin.path, 'DATEN', 'DListen.ADT')
    dataPath = path.join(settings.import.eoswin.path, 'EOSWIN', 'DefList')

    parseMeta metaPath, (meta) ->

      getMeta = (key) ->
        key = path.basename(key)
        key = key.slice(0, key.indexOf('.'))
        logger.info("[Import] EoswinReports: Meta for #{key} is #{meta[key]}")
        return meta[key]

      pattern = path.join(dataPath, 'ARZTSTAT*.adt')
      glob pattern, (err, files) ->
        return logger.error("[Import] EoswinReports: Error #{err}") if err
        return logger.error("[Import] EoswinReports: Glob empty: #{pattern}") if files.length is 0

        files = files.sort(naturalSort)
        files = files.reverse()

        if options.all
          logger.info("[Import] EoswinReports: Uploading all #{files.length} reports")
          uploadStream.upload(files, importer: 'eoswinReports', meta: (files) -> getMeta(files))

        else if files.length > 0
          file = files[0]
          logger.info("[Import] EoswinReports: Uploading latest report #{file}")
          uploadStream.upload(file, importer: 'eoswinReports', meta: getMeta(file))
