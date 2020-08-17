const fs = require('fs')
const path = require('path')
const temp = require('temp')
const pdfToPrinter = require('pdf-to-printer')
const { shell, ipcMain } = require('electron')
const logger = require('./logger')

const start = (options) => {
  temp.track()
  ipcMain.on('print', (e, printOptions) => {

    const { title, physical, printer, flags, localPath } = printOptions
    if (physical && localPath) {
      const args = {
        printer,
        win32: flags
      }

      console.log(`[print] physical file "${localPath}" on printer "${printer}" with flags ${JSON.stringify(args)}`)
      pdfToPrinter(localPath, args)
    } else {
      options.title = title
      console.log(options.title)
      printToPdf(options)
    }
  })
}

const printToPdf = (options) => {
  temp.mkdir('rosalind', (err, tmpDir) => {
    if (err) { return logger.error(err) }
    const pdfPath = path.join(tmpDir, (options.title || 'Print') + '.pdf')

    const printOptions = {
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: true
    }

    options.ipcReceiver.printToPDF(printOptions, (err, data) => {
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
        const ok = shell.openItem(pdfPath)
        if (!ok) {
          logger.error('[Print] failed to open pdf: ' + pdfPath)
        }
      })
    })
  })
}

module.exports = {
  start
}
