const fs = require('fs')
const path = require('path')
const open = require('open')
const temp = require('temp')
const { ipcMain } = require('electron')
const logger = require('./logger')
const settings = require('./settings')

const start = (options) => {
  temp.track()
  ipcMain.on('window/print', (e, printOptions) => {
    options.title = printOptions.title
    console.log(options.title)
    print(options)
  })
}

const print = (options) => {
  temp.mkdir('rosalind', (err, tmpDir) => {
    const pdfPath = path.join(tmpDir, (options.title || 'Print') + '.pdf')

    const printOptions = {
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: true
    }

    options.ipcReceiver.webContents.printToPDF(printOptions, (err, data) => {
      if (err) {
        logger.error('[Print] Failed to generate pdf: ' + err)
        return
      }
      
      fs.writeFile(pdfPath, data, (err) => {
        if (err) {
          logger.error('[Print] Failed to save pdf: ' + err)
          return
        }
        logger.info('[Print] Saved pdf to path: ' + pdfPath)
        open(pdfPath)
      })
    })
  })
}

module.exports = {
  start,
  print
}