const childProcess = require('child_process')
const { ipcMain } = require('electron')
const logger = require('./logger')
const { getSettings } = require('./settings')
const { captureException } = require('@sentry/electron')

const isShellSafe = s =>
  s && s.match(/^[a-z0-9 \$():\/"\\\.-]+$/i)

const start = async (argv = []) => {
  ipcMain.on('scanStart', (e, payload) => {
    logger.info('[automation] scanStart', payload)
    scan({ profile: payload.profile })
  })
}

const spawn = (exePath, spawnArgs) => {
  if (!isShellSafe(exePath)) {
    throw new Error(`Exe path is not shell safe: ${exePath}`)
  }

  if (!spawnArgs.every(isShellSafe)) {
    throw new Error(`Exe spawn args not shell safe: ${JSON.stringify(spawnArgs)}`)
  }

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
  try {
    logger.info('[automation] scan', { profile })

    const settings = getSettings()

    if (profile && !isShellSafe(profile)) {
      throw new Error('Profile given is not shell safe')
    }

    if (!settings.scan) {
      throw new Error('Scanning requires settings.scan.[scan.napsConsolePath|allowedProfiles|tempPath] to be set')
    }

    if (!settings.scan.napsConsolePath) {
      throw new Error('Scanning requires settings.scan.scan.napsConsolePath to be set to the full path to NAPS2.Console.exe')
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

    return spawn(settings.scan.napsConsolePath, args)
  } catch (e) {
    logger.error('Failed to scan', e)
  }
}

module.exports = { start }
