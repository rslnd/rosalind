const childProcess = require('child_process')
const path = require('path')
const { app, ipcMain } = require('electron')
const logger = require('./logger')
const settings = require('./settings')
const { captureException } = require('@sentry/electron')

const exePath = path.resolve(path.join(process.resourcesPath, 'generateEoswinReports.exe'))
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

  ipcMain.on('automation/generateEoswinReports', ({ day } = {}) => {
    generateEoswinReports({ day })
  })
}

const generateEoswinReports = async ({ day } = {}) => {
  logger.info('[automation] Spawning', exePath)

  let spawnArgs = []

  if (settings.eoswinExe) {
    spawnArgs.push(`/eoswinExe:${settings.eoswinExe}`)
  }

  if (day && typeof day === 'object' && day.day && day.month && day.year && typeof day.day === 'number' && typeof day.month === 'number' && typeof day.year === 'number') {
    const formatted = [day.year, day.month, day.day].join('-')
    logger.info('[automation] generateEoswinReports: Setting report day to', formatted)
    spawnArgs.push(`/day:${formatted}`)
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

module.exports = { start }
