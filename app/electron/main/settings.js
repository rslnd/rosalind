const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const childProcess = require('child_process')
const { ipcMain, app } = require('electron')
const logger = require('./logger')

const settingsPath = path.join(app.getPath('userData'), 'RosalindSettings.json')

const editSettings = () => {
  logger.info('[Settings] Spawning settings editor')
  if (process.platform === 'darwin') {
    childProcess.spawn('open', [ settingsPath ])
  } else if (process.platform === 'win32' || process.platform === 'win64') {
    childProcess.spawn('cmd', [ '/s', '/c', 'start', 'wordpad', settingsPath ])
  }
}

const generateClientKey = () =>
  crypto.randomBytes(265).toString('hex')

const generateDefaultSettings = () => ({
  url: 'http://0.0.0.0:3000',
  clientKey: generateClientKey(),
  customer: {
    name: 'Rosalind'
  },
  watch: [
    { path: 'S:\\Export\\Tagesjournale', importer: 'eoswinJournalReports', enabled: false },
    { path: 'S:\\Export\\Umsatzstatistiken', importer: 'eoswinRevenueReports', enabled: false },
    { path: 'S:\\Export\\Patienten', importer: 'eoswinPatients', enabled: false },
    { path: 'C:\\xdt', importer: 'xdt', enabled: true }
  ]
})

let settings = null

if (fs.existsSync(settingsPath) && fs.readFileSync(settingsPath).length > 3) {
  logger.info('[Settings] Loading existing settings from', settingsPath)
  settings = {}

  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, { encoding: 'utf8' }))
    logger.info('[Settings] Loaded existing settings', settings)

    if (!settings.clientKey) {
      logger.info('[Settings] Generating new client key')
      const clientKey = generateClientKey()
      settings.clientKey = clientKey
      fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), { encoding: 'utf8' }, (err) => {
        if (err) {
          logger.error('[Settings] Cannot write client key', err)
          editSettings()
          app.quit()
        }
      })
    }
  } catch (e) {
    logger.error('[Settings] Cannot parse settings file', e)
    editSettings()
    app.quit()
  }
} else {
  logger.info('[Settings] Writing default settings to', settingsPath)
  const defaultSettings = generateDefaultSettings()
  fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2), { encoding: 'utf8' }, (err) => {
    if (err) {
      return logger.error('[Settings] Cannot write default settings', err)
    }
    editSettings()
    app.quit()
  })
  settings = defaultSettings
}

settings.settingsPath = settingsPath

logger.info('[Settings] The main entry point is', settings.url)
logger.info('[Settings]', settings)

ipcMain.on('settings/edit', (e) => {
  logger.info('[Settings] Requested settings edit via ipc')
  editSettings()
})

settings.send = ({ ipcReceiver }) => {
  ipcReceiver.webContents.send('settings', settings)
}

module.exports = settings
