const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const childProcess = require('child_process')
const { ipcMain, app } = require('electron')
const logger = require('./logger')

const isWindows = (process.platform === 'win32' || process.platform === 'win64')

const defaultSettingsPath = isWindows ? 'S:\\RosalindSettingsDefault.json' : null
const localSettingsPath = path.join(app.getPath('userData'), 'RosalindSettings.json')

const emptySettings = {}

let settings = {}

const readSettings = path => {
  if (!path) {
    logger.warn(`[Settings] No path specified to read settings from`)
    return emptySettings
  }

  if (!fs.existsSync(path)) {
    logger.warn(`[Settings] No settings file at path ${path}`)
    return emptySettings
  }

  const raw = fs.readFileSync(path, { encoding: 'utf8' })

  if (raw.length < 4) {
    logger.warn(`[Settings] Skipping settings file at path ${path} containing '${raw}' because it is too short`)
    return emptySettings
  }

  try {
    return JSON.parse(raw)
  } catch (e) {
    logger.error(`[Settings] Failed to parse settings file at path ${path} containing '${raw}'`)
    return emptySettings
  }
}

const mergeSettings = (local, remote) => {
  return Object.assign({}, local, remote)
}

const ensureClientKey = settings => {
  if (typeof settings.clientKey === 'string' && settings.clientKey.length >= 128 ) {
    return settings
  } else {
    return Object.assign({}, settings, {
      clientKey: generateClientKey()
    })
  }
}

const generateClientKey = () =>
  crypto.randomBytes(265).toString('hex')

const validateSettings = settings => {
  if (!settings.url) {
    logger.error('[Settings] Missing setting key "url"')
    return false
  }

  if (!settings.clientKey) {
    logger.error('[Settings] Missing setting key "clientKey"')
    return false
  }

  if (!settings.customer || !settings.customer.name) {
    logger.error('[Settings] Missing setting key "customer.name"')
    return false
  }

  return true
}

const writeSettings = newSettings => {
  logger.info('[Settings] Writing settings to', localSettingsPath)
  fs.writeFile(localSettingsPath, JSON.stringify(newSettings, null, 2), { encoding: 'utf8' }, (err) => {
    if (err) {
      return logger.error('[Settings] Cannot write settings', err)
    }
  })
}

const editSettings = path => {
  logger.info('[Settings] Spawning settings editor')
  if (process.platform === 'darwin') {
    childProcess.spawn('open', [ path ])
  } else if (isWindows) {
    childProcess.spawn('cmd', [ '/s', '/c', 'start', 'wordpad', path ])
  }
}

const terminate = () => {
  logger.info('[Settings] Terminating app')
  app.quit()
  process.exit(1)
}

const getSettings = () => {
  const defaultSettings = defaultSettingsPath && readSettings(defaultSettingsPath)
  const localSettings = readSettings(localSettingsPath)

  if (defaultSettings === emptySettings && localSettings === emptySettings) {
    editSettings(localSettingsPath)
    terminate()
  }

  const mergedSettings = mergeSettings(localSettings, defaultSettings)
  if (!validateSettings(mergedSettings)) {
    editSettings(localSettingsPath)
    terminate()
  }

  writeSettings(mergedSettings)

  settings = mergedSettings
  settings.settingsPath = localSettingsPath

  logger.info('[Settings] The main entry point is', settings.url)
  logger.info('[Settings]', settings)

  ipcMain.on('settings/edit', (e) => {
    logger.info('[Settings] Requested settings edit via ipc')
    editSettings()
  })

  settings.send = ({ ipcReceiver }) => {
    ipcReceiver.webContents.send('settings', settings)
  }

}

getSettings()

module.exports = settings
