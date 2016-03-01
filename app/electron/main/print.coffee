fs = require 'fs'
path = require 'path'
open = require 'open'
temp = require 'temp'
ipc = require('electron').ipcMain
logger = require './logger'
settings = require './settings'

module.exports =
  start: (options) ->
    temp.track()
    ipc.on 'window/print', (e, printOptions) =>
      options.title = printOptions.title
      console.log(options.title)
      @print(options)

  print: (options) ->
    temp.mkdir 'rosalind', (err, tmpDir) ->
      pdfPath = options.title or 'Print'
      pdfPath = pdfPath + '.pdf'
      pdfPath = path.join(tmpDir, pdfPath)

      printOptions =
        marginsType: 0
        printBackground: true
        printSelectionOnly: false
        landscape: true

      options.ipcReceiver.webContents.printToPDF printOptions, (err, data) ->
        return logger.error('[Print] Failed to generate pdf: ' + err) if err
        fs.writeFile pdfPath, data, (err) ->
          return logger.error('[Print] Failed to save pdf: ' + err) if err
          logger.info('[Print] Saved pdf to path: ' + pdfPath)
          open(pdfPath)
