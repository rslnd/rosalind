const fs = require('fs')
const path = require('path')
const { app, ipcMain } = require('electron')
const logger = require('./logger')

const isWindows = /^win/.test(process.platform)

const defaultSettingsPath = isWindows ? 'S:\\RosalindSettingsDefault.json' : null
const localSettingsPath = path.join(app.getPath('userData'), 'RosalindSettings.json')

let remoteSettings = {}
let newSettingsSubscribers = []

const setRemoteSettings = (e, newRemoteSettings) => {
  logger.info('[Settings] New remote settings', newRemoteSettings)
  remoteSettings = newRemoteSettings

  const newSettings = getSettings()
  newSettingsSubscribers.forEach(handler => {
    handler(newSettings)
  })
}

ipcMain.on('settings', setRemoteSettings)

const onNewSettings = (handler) => {
  newSettingsSubscribers.push(handler)
}

const readSettings = path => {
  try {
    const raw = fs.readFileSync(path, { encoding: 'utf8' })

    if (raw.length < 4) {
      logger.warn(`[Settings] Skipping settings file at path ${path} containing '${raw}' because it is too short`)
      return {}
    }

    try {
      return JSON.parse(raw)
    } catch (e) {
      logger.error(`[Settings] Failed to parse settings file at path ${path} containing '${raw}'`)
      return {}
    }
  } catch (e) {
    logger.error(`[Settings] Failed to read settings file at path ${path}`)
    return {}
  }
}

const getSettings = () => {
  const defaultSettings = defaultSettingsPath ? readSettings(defaultSettingsPath) : {}
  const localSettings = readSettings(localSettingsPath)

  const settings = {
    ...defaultSettings,
    ...localSettings,
    ...remoteSettings
  }

  return settings
}

module.exports = { getSettings, onNewSettings }
