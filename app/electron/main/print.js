const fs = require('fs')
const path = require('path')
const temp = require('temp')
const pdfToPrinter = require('pdf-to-printer')
const { shell, ipcMain, webContents } = require('electron')
const logger = require('./logger')

const start = (options) => {
  logger.info('print setup')
  temp.track()

  logger.info('print tracking')
  ipcMain.on('print', (e, printOptions) => {
    logger.info('print called')
    const { title, physical, printer, flags, localPath, base64 } = printOptions
    if (physical && (base64 || localPath)) {
      logger.info('print physical')
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
        logger.info('print localPath')
        logger.info(`[print] physical local path file "${localPath}" on printer "${printer}" with flags ${JSON.stringify(args)}`)
        pdfToPrinter.print(localPath, args)
      }
    } else {
      logger.info('print toPdf')
      options.title = title
      printToPdf(options)
    }
  })
}

const printToPdf = (options) => {
  logger.info('print making temp')
  temp.mkdir('rosalind', (err, tmpDir) => {
    logger.info('print made')
    if (err) { return logger.error(err) }
    const pdfPath = path.join(tmpDir, (options.title || 'Print') + '.pdf')

    const printOptions = {
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: true
    }

    logger.info('print calling ipcReceiver.printToPDF')
    webContents.getFocusedWebContents().printToPDF(printOptions).then(data => {
      logger.info('print writing file')
      fs.writeFile(pdfPath, data, (err) => {
        if (err) {
          logger.error('[Print] Failed to save pdf: ' + err)
          return
        }
        logger.info('[Print] Saved pdf to path: ' + pdfPath)

        logger.info('print opening file')
        const ok = shell.openPath(pdfPath)
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
