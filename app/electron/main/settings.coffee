fs = require 'fs'
path = require 'path'
childProcess = require 'child_process'
_ = require 'lodash'
electron = require 'app'
ipc = require('electron').ipcMain
logger = require './logger'

unless @Settings?
  settings = null

  settingsPath = path.join(electron.getPath('userData'), 'RosalindSettings.json')

  defaultSettings =
    url: 'http://dev.rslnd.com:3000'
    updateUrl: 'https://update.rslnd.com'
    customer:
      name: 'Rosalind'
    import:
      bdt:
        enabled: false
        path: ''
        delete: true
      terminiko:
        enabled: false
        path: 'Arztprax.mdb'
      eoswin:
        path: ''
        modules:
          patients: false
          reports: false

  if fs.existsSync(settingsPath)
    logger.info('[Settings] Loading existing settings from', settingsPath)
    persistedSettings = {}

    try
      persistedSettings = JSON.parse(fs.readFileSync(settingsPath, encoding: 'utf8') )
      logger.info('[Settings] Loaded existing settings', settings)

    catch e
      logger.error('[Settings] Cannot parse settings file', e)


    if _.isEqual(persistedSettings, defaultSettings)
      settings = persistedSettings
    else
      settings = _.merge({}, defaultSettings, persistedSettings)
      logger.info('[Settings] Merging settings', settings)
      logger.info('[Settings] Writing updated settings to', settingsPath, )
      fs.writeFile settingsPath, JSON.stringify(settings, null, 2), encoding: 'utf8', (err) ->
        logger.error('[Settings] Cannot write updated settings', err) if err?

  else
    logger.info('[Settings] Writing default settings to', settingsPath)
    fs.writeFile settingsPath, JSON.stringify(defaultSettings, null, 2), encoding: 'utf8', (err) ->
      logger.error('[Settings] Cannot write default settings', err) if err?
    settings = defaultSettings

  settings.settingsPath = settingsPath
  @Settings = settings

  logger.info('[Settings] The main entry point is', @Settings.url)
  logger.info('[Settings]', @Settings)

  ipc.on 'settings', (e) =>
    logger.info('[Settings] Requested settings via ipc', @Settings)
    e.sender.send('settings', @Settings)

  ipc.on 'settings/edit', (e) =>
    logger.info('[Settings] Requested settings edit via ipc', @Settings)
    editor = 'open' if process.platform is 'darwin'
    editor = 'wordpad' if process.platform is 'win32' or process.platform is 'win64'
    childProcess.spawn(editor, [ settingsPath ])


module.exports = @Settings
