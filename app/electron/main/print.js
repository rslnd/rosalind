const fs = require('fs')
const path = require('path')
const temp = require('temp')
const pdfToPrinter = require('pdf-to-printer')
const { shell, ipcMain } = require('electron')
const logger = require('./logger')

const start = (options) => {
  temp.track()
  ipcMain.on('print', (e, printOptions) => {

    const { title, physical, printer, flags, localPath, base64 } = printOptions
    if (physical && (base64 || localPath)) {
      const args = {
        printer,
        win32: flags
      }

      // if given, a file/uri encoded as base64 (usually a custom filled form) takes precedence over localPath
      if (base64) {
        const urlPrefix = 'data:application/pdf;base64,'
        const stripped = base64.replace(urlPrefix, '')
        const buffer = Buffer.from(stripped, 'base64')

        temp.mkdir('rosalind', (err, tmpDir) => {
          if (err) { return logger.error(err) }
          const tempPath = path.join(tmpDir, Math.random().toString(36).substring(7) + '.pdf')

          fs.writeFile(tempPath, buffer, async err => {
            if (err) {
              return logger.error(err)
            }

            logger.info(`[print] temp file "${tempPath}" from base64 on printer "${printer}" with flags ${JSON.stringify(args)}`)
            await pdfToPrinter.print(tempPath, args)
            setTimeout(() => fs.unlink(tempPath, () => {}), 30 * 1000) // privacy
          })
        })
      } else if (localPath) {
        logger.info(`[print] physical local path file "${localPath}" on printer "${printer}" with flags ${JSON.stringify(args)}`)
        pdfToPrinter.print(localPath, args)
      }
    } else {
      options.title = title
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
