'use strict'

app = require('app')
updater = require('electron-gh-releases')
BrowserWindow = require('browser-window')

mainWindow = null
require('crash-reporter').start()

app.setAppUserModelId('com.squirrel.rosalind.rosalind')

handleStartupEvent = ->
  return false if process.platform isnt 'win32'

  squirrelCommand = process.argv[1]
  console.log('[Updater] Squirrel flags: ', squirrelCommand)

  switch (squirrelCommand)
    when '--squirrel-install' or '--squirrel-updated'

      # Optionally do things such as:
      #
      # - Install desktop and start menu shortcuts
      # - Add your .exe to the PATH
      # - Write to the registry for things like file associations and
      #   explorer context menus

      # Always quit when done
      app.quit()

      return true
    when '--squirrel-uninstall'
      # Undo anything you did in the --squirrel-install and
      # --squirrel-updated handlers

      # Always quit when done
      app.quit()

      return true
    when '--squirrel-obsolete'
      # This is called on the outgoing version of your app before
      # we update to the new version - it's the opposite of
      # --squirrel-updated
      app.quit()
      return true

return if handleStartupEvent()

updater = new updater
  repo: 'albertzak/rosalind'
  currentVersion: ( ->
    v = app.getVersion()
    console.log('[Updater] Current Version: ', v)
    return v
  )()

updater.check (err, status) ->
  if (err)
    console.error('[Updater] Error while checking for updates: ', err)
  if (not err and status)
    console.log('[Updater] Update check finished: ', status)
    updater.download()

updateDownloaded = false

updater.on 'update-downloaded', (info) ->
  console.log('[Updater] Update downloaded: ', info)
  updateDownloaded = true


app.on 'ready', ->
  electronScreen = require('screen')
  display = electronScreen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow
    x: display.x,
    y: display.y,
    width: display.width,
    height: display.height,
    'min-width': 560,
    'min-height': 426,
    'disable-auto-hide-cursor': true,
    'node-integration': false,
    'preload': require.resolve('../renderer/native.js'),
    'web-preferences':
      'text-areas-are-resizable': false,
      'experimental-canvas-features': true,
      'subpixel-font-scaling': true,
      'overlay-scrollbars': false

  mainWindow.loadURL('http://127.0.0.1:3000')
  mainWindow.maximize()


  mainWindow.on 'closed', ->
    if (updateDownloaded)
      console.log('[Updater] Installing update now')
      updater.install()

    mainWindow = null
