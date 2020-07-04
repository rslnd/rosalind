const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const { app, dialog, ipcMain } = require('electron')
const logger = require('./logger')
const isEqual = require('lodash/isEqual')

const isWindows = /^win/.test(process.platform)

const defaultSettingsPath = isWindows ? 'S:\\RosalindSettingsDefault.json' : null
const localSettingsPath = path.join(app.getPath('userData'), 'RosalindSettings.json')

const emptySettings = {}

let settings = {}
let remoteSettings = {}

const setRemoteSettings = (e, newRemoteSettings) => {
  logger.info('[Settings] New remote settings', newRemoteSettings)
  remoteSettings = newRemoteSettings
}

ipcMain.on('settings', setRemoteSettings)

const readSettings = path => {
  if (!path) {
    logger.warn(`[Settings] No path specified to read settings from`)
    return emptySettings
  }

  if (!fs.existsSync(path)) {
    logger.warn(`[Settings] No settings file at path ${path}`)
    return emptySettings
  }

  try {
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
  } catch (e) {
    logger.error(`[Settings] Failed to read settings file at path ${path}`)
    return emptySettings
  }
}

const mergeSettings = (local, remote) => {
  let topLevel = Object.assign({}, local, remote)

  return topLevel
}

const ensureClientKey = settings => {
  if (typeof settings.clientKey === 'string' && settings.clientKey.length >= 128) {
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
  if (newSettings === emptySettings || Object.keys(newSettings).length <= 2) {
    logger.error('[Settings] Skipping writing settings because it is empty')
    return
  }
  logger.info('[Settings] Writing settings to', localSettingsPath)
  fs.writeFile(localSettingsPath, JSON.stringify(newSettings, null, 2), { encoding: 'utf8' }, (err) => {
    if (err) {
      return logger.error('[Settings] Cannot write settings', err)
    }
  })
}

const terminate = () => {
  logger.info('[Settings] Terminating app')
  app.exit(1)
}

const getSettings = () => {
  const defaultSettings = defaultSettingsPath && readSettings(defaultSettingsPath)
  const localSettings = readSettings(localSettingsPath)

  if ((defaultSettings === emptySettings && localSettings === emptySettings) || (!defaultSettings && !localSettings)) {
    logger.error(`[Settings] All settings are empty`)
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      title: 'Error',
      message: 'Empty settings file'
    })
    terminate()
  }

  const mergedSettings = ensureClientKey(
    mergeSettings(
      mergeSettings(localSettings, defaultSettings),
      remoteSettings
    )
  )

  if (!validateSettings(mergedSettings)) {
    logger.error(`[Settings] Invalid settings`)
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      title: 'Error',
      message: 'Invalid settings file'
    })
    terminate()
  }

  if (!isEqual(localSettings, mergedSettings)) {
    logger.info('[Settings] Local settings are different from merged settings, overwriting local settings')
    writeSettings(mergedSettings)
  }

  settings = mergedSettings
  settings.settingsPath = localSettingsPath

  const {clientKey, ...nonSensitiveSettings} = settings
  logger.info('[Settings]', nonSensitiveSettings)

  return settings
}

getSettings()

module.exports = { getSettings }
