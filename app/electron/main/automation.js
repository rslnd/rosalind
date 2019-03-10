const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const temp = require('temp')
const { app, ipcMain } = require('electron')
const logger = require('./logger')
const settings = require('./settings')
const { captureException } = require('@sentry/electron')

const exeName = path.resolve(path.join(process.resourcesPath, 'generateEoswinReports.exe'))
const printerSettingsName = path.resolve(path.join(process.resourcesPath, 'eoswinPrinter.reg'))
const closeRosalindTimeout = 10 * 60 * 1000

const start = async (argv = []) => {
  if (argv.join(' ').indexOf('generateEoswinReports') !== -1) {
    await generateEoswinReports()
    logger.info('[automation] generateEoswinReports: Quitting in', closeRosalindTimeout, 'ms')
    setTimeout(() => {
      logger.info('[automation] generateEoswinReports: Quitting now')
      app.quit()
    }, closeRosalindTimeout)
  }

  ipcMain.on('webEvent', (name, { day } = {}) => {
    if (name === 'automation/generateEoswinReports') {
      generateEoswinReports({ day })
    }
  })
}

const generateEoswinReports = async ({ day } = {}) => {
  const { cleanup, paths: [exePath] } = await extractAssets([exeName, printerSettingsName])

  logger.info('[automation] Spawning', exePath)

  let spawnArgs = []

  if (settings.eoswinExe) {
    spawnArgs.push(`/eoswinExe:${settings.eoswinExe}`)
  }

  if (day) {
    spawnArgs.push(`/day:${day.year}-${day.month}-${day.day}`)
  }

  const child = childProcess.spawn(exePath, spawnArgs)
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')

  let stdoutBuffer = []
  let stderrBuffer = []

  child.stdout.on('data', d =>
    stdoutBuffer.push(logger.info('[automation] generateEoswinReports', d))
  )

  child.stderr.on('data', d =>
    stderrBuffer.push(logger.error('[automation] generateEoswinReports error:', d))
  )

  return new Promise((resolve, reject) => {
    child.on('close', async code => {
      logger.info('[automation] generateEoswinReports exited with code', code)

      await cleanup()

      if (code !== 0) {
        captureException(new Error(
          logger.error('[automation] generateEoswinReports failed', { stdoutBuffer, stderrBuffer })
        ))
        reject(code)
      } else {
        resolve()
      }
    })
  })
}

const extractAssets = (sourcePaths, cb) => {
  temp.track()

  temp.mkdir('rosalind', (err, tmpDir) => {
    if (err) { return cb(err) }

    const promises = sourcePaths.map(sourcePath => {
      const tempPath = path.join(tmpDir, path.basename(sourcePath))

      logger.info(`[automation] extracting asset from ${sourcePath} -> ${tempPath}`)

      const read = fs.createReadStream(sourcePath)
      const write = fs.createWriteStream(tempPath)

      return new Promise((resolve, reject) => {
        read.on('error', e => cb(e))
        write.on('error', e => cb(e))
        write.on('close', e => resolve(tempPath))

        read.pipe(write)
      })
    })

    const cleanup = () => new Promise(resolve => temp.cleanup(resolve))

    return Promise.all(promises).then(paths =>
      cb(null, { cleanup, paths })
    )
  })
}

module.exports = { start }
