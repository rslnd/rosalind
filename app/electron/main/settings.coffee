fs = require 'fs'
path = require 'path'
childProcess = require 'child_process'
{ ipcMain, app } = require 'electron'
logger = require './logger'

settingsPath = path.join(app.getPath('userData'), 'RosalindSettings.json')

editSettings = ->
  logger.info('[Settings] Spawning settings editor')
  if process.platform is 'darwin'
    childProcess.spawn('open', [ settingsPath ])
  else if process.platform is 'win32' or process.platform is 'win64'
    childProcess.spawn('cmd', [ '/s', '/c', 'start', 'wordpad', settingsPath ])

settings = null

defaultSettings =
  url: 'http://0.0.0.0:3000'
  customer:
    name: 'Rosalind'
  watch: [
    { path: 'S:\\Export', importer: 'eoswinReports', enabled: true }
    { path: 'S:\\Export\\Patients', importer: 'eoswinPatients', enabled: true }
    { path: 'C:\\xdt', importer: 'xdt', enabled: false }
  ]

if fs.existsSync(settingsPath) and fs.readFileSync(settingsPath).length > 3
  logger.info('[Settings] Loading existing settings from', settingsPath)
  settings = {}

  try
    settings = JSON.parse(fs.readFileSync(settingsPath, encoding: 'utf8') )
    logger.info('[Settings] Loaded existing settings', settings)

  catch e
    logger.error('[Settings] Cannot parse settings file', e)
    editSettings()
    app.quit()

else
  logger.info('[Settings] Writing default settings to', settingsPath)
  fs.writeFile settingsPath, JSON.stringify(defaultSettings, null, 2), encoding: 'utf8', (err) ->
    return logger.error('[Settings] Cannot write default settings', err) if err?
    editSettings()
    app.quit()
  settings = defaultSettings

settings.settingsPath = settingsPath

logger.info('[Settings] The main entry point is', settings.url)
logger.info('[Settings]', settings)

ipcMain.on 'settings', (e) ->
  logger.info('[Settings] Requested settings via ipc')
  e.sender.send('settings', settings)

ipcMain.on 'settings/edit', (e) ->
  logger.info('[Settings] Requested settings edit via ipc')
  editSettings()

module.exports = settings
