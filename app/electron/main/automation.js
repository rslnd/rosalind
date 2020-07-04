const childProcess = require('child_process')
const path = require('path')
const { app, ipcMain } = require('electron')
const logger = require('./logger')
const { getSettings } = require('./settings')
const { captureException } = require('@sentry/electron')

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

  ipcMain.on('scanStart', ({ profile } = {}) => {
    scan({ profile })
  })
}

const spawn = (exePath, spawnArgs) => {
  const child = childProcess.spawn(exePath, spawnArgs)
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')

  let stdoutBuffer = []
  let stderrBuffer = []

  child.stdout.on('data', d =>
    stdoutBuffer.push(logger.info('[automation]', d))
  )

  child.stderr.on('data', d =>
    stderrBuffer.push(logger.error('[automation] error:', d))
  )

  return new Promise((resolve, reject) => {
    child.on('close', async code => {
      logger.info('[automation] exited with code', code)

      if (code !== 0) {
        captureException(new Error(
          logger.error('[automation] spawn failed', { stdoutBuffer, stderrBuffer })
        ))
        reject(code)
      } else {
        resolve()
      }
    })
  })
}

const scan = ({ profile }) => {
  logger.info('[automation] scan', { profile })

  const settings = getSettings()

  if (!settings.scan) {
    throw new Error('Scanning requires settings.scan.[napsConsolePath|allowedProfiles|tempPath] to be set')
  }

  if (!settings.scan.napsConsolePath) {
    throw new Error('Scanning requires settings.scan.napsConsolePath to be set to the full path to NAPS2.Console.exe')
  }

  if (!settings.scan.allowedProfiles) {
    throw new Error('Scanning requires settings.scan.allowedProfiles to be set to an array of strings (profile names)')
  }

  if (!settings.scan.tempPath) {
    throw new Error('Scanning requires settings.scan.tempPath to be set to the full path of the local directory where scans should be saved before being uploaded. Make sure a watcher with the media importer is set up watching the same path.')
  }

  if (profile && settings.scan.allowedProfiles.indexOf(profile) === -1) {
    throw new Error(`The profile ${profile} is not listed under settings.scan.allowedProfiles (${settings.scan.allowedProfiles.join(', ')})`)
  }

  const args = [
    '--output', settings.scan.tempPath,
    '--profile', profile || settings.scan.allowedProfiles[0]
  ]

  return spawn(settings.napsConsolePath, args)
}

const generateEoswinReports = async ({ day } = {}) => {
  const generateEoswinReportsExe = path.resolve(path.join(process.resourcesPath, 'assets', 'generateEoswinReports.exe'))
  logger.info('[automation] Spawning', generateEoswinReportsExe)

  let spawnArgs = []

  const settings = getSettings()

  if (settings.eoswinExe) {
    spawnArgs.push(`/eoswinExe:${settings.eoswinExe}`)
  }

  if (day && typeof day === 'object' && day.day && day.month && day.year && typeof day.day === 'number' && typeof day.month === 'number' && typeof day.year === 'number') {
    const formatted = [day.year, day.month, day.day].join('-')
    logger.info('[automation] generateEoswinReports: Setting report day to', formatted)
    spawnArgs.push(`/day:${formatted}`)
  }

  return spawn(generateEoswinReportsExe, spawnArgs)
}

module.exports = { start }
