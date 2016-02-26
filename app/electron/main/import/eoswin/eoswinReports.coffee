logger = require('../../logger')
settings = require('../../settings')
uploadStream = require('../../uploadStream')
ipc = require('electron').ipcMain
glob = require('glob')
path = require('path')
naturalSort = require('javascript-natural-sort')

module.exports =
  start: ->
    return unless settings.import.eoswin.reports.enabled
    logger.info('[Import] EoswinReports: Enabled', settings.import.eoswin.reports.path)

    ipc.on('import/eoswin/reports', @import)

  import: (options) ->
    return unless settings.import.eoswin.reports.enabled

    pattern = path.join(settings.import.eoswin.reports.path, 'ARZTSTAT*.adt')
    glob pattern, (err, files) ->
      if options.all
        logger.info("[Import] EoswinReports: Uploading all #{files.count} reports")
        uploadStream.upload(files, importer: 'eoswinReports')

      else if files.length > 0
        files.sort(naturalSort)
        file = files[files.length - 1]
        logger.info("[Import] EoswinReports: Uploading latest report #{file}")
        uploadStream.upload(file, importer: 'eoswinReports')
