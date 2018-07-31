const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const temp = require('temp')
const { ipcMain } = require('electron')
const logger = require('./logger')

const exeName = 'generateEoswinReports.exe'
const printerSettingsName = 'eoswinPrinter.reg'

const start = (argv = []) => {
  if (argv.join(' ').indexOf('generateEoswinReports') !== -1) {
    generateEoswinReports()
  }

  ipcMain.on('webEvent', (name, { day }) => {
    if (name === 'automation/generateEoswinReports') {
      generateEoswinReports({ day })
    }
  })
}

const generateEoswinReports = ({ day } = {}) => {
  extractAsset(printerSettingsName, (err) => {
    if (err) {
      logger.error('[automation] Failed to extract printer settings', err)
      return
    }

    extractAsset(exeName, (err, exePath) => {
      if (err) {
        logger.error('[automation] Failed to extract exe', err)
        return
      }

      logger.info('[automation] Spawning', exePath)

      const spawnArgs = day
        ? [`/day:${day.year}-${day.month}-${day.day}`]
        : []

      const child = childProcess.spawn(exePath, spawnArgs)
      child.stdout.setEncoding('utf8')
      child.stderr.setEncoding('utf8')

      child.stdout.on('data', d =>
        logger.info('[automation] generateEoswinReports', d)
      )

      child.stderr.on('data', d =>
        logger.error('[automation] generateEoswinReports error:', d)
      )

      return new Promise((resolve, reject) => {
        child.on('close', code => {
          logger.info('[automation] generateEoswinReports exited with code', code)

          if (code !== 0) {
            logger.error('[automation] generateEoswinReports failed')
            reject(code)
          } else {
            resolve()
          }
        })
      })
    })
  })
}

const extractAsset = (filename, cb) => {
  temp.track()

  temp.mkdir('rosalind', (err, tmpDir) => {
    if (err) { return cb(err) }
    const asarPath = path.join(__dirname, '..', filename)
    const tempPath = path.join(tmpDir, filename)

    logger.info(`[automation] extracting asset '${filename}' from ${asarPath} -> ${tempPath}`)

    const read = fs.createReadStream(asarPath)
    const write = fs.createWriteStream(tempPath)

    read.on('error', e => cb(e))
    write.on('error', e => cb(e))
    write.on('close', e => cb(null, tempPath))

    read.pipe(write)
  })
}

module.exports = { start }
