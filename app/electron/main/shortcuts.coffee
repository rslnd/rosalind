fs = require 'fs'
shortcut = require 'windows-shortcuts-appid'
electron = require 'app'
logger = require './logger'
manifest = require './manifest'

module.exports =
  shortcutPaths: [
    process.env.APPDATA + '\\Microsoft\\Windows\\Start Menu\\Programs\\' + manifest.productName + '.lnk'
    process.env.USERPROFILE + '\\Desktop\\' + manifest.productName + '.lnk'
  ]

  shortcutOptions:
    target: process.execPath
    runStyle: shortcut.MAX
    desc: manifest.productName + ' v' + manifest.version
    args: ''
    icon: process.execPath

  updateShortcuts: ->
    return unless process.platform is 'win32'
    logger.info('[Update] Updating shortcuts')

    @shortcutPaths.forEach (shortcutPath) =>
      fs.exists shortcutPath, (exists) =>
        unless exists
          @createShortcut(shortcutPath)
        else
          @updateShortcut(shortcutPath)

  deleteShortcuts: ->
    @shortcutPaths.forEach (shortcutPath) =>
      @deleteShortcut(shortcutPath)

  createShortcut: (shortcutPath) ->
    logger.info('[Updater] Creating new shortcut', shortcutPath)
    shortcut.create shortcutPath, @shortcutOptions, (err) ->
      return logger.error('[Updater] Could not create shortcut', { err, shortcutPath }) if err
      logger.info('[Updater] Created shortcut', shortcutPath)
      shortcut.addAppId shortcutPath, appId, (err) ->
        logger.error('[Updater] Could not link app id', err) if err

  updateShortcut: (shortcutPath) ->
    logger.info('[Updater] Querying existing shortcut', shortcutPath)
    shortcut.query shortcutPath, (err, info) =>
      return logger.error('[Updater] Could not query existing shortcut', { err, shortcutPath }) if err
      existingTarget = info.expanded.target or info.target
      if existingTarget isnt @shortcutOptions.target
        logger.info('[Updater] Updating existing shortcut', shortcutPath)
        shortcut.edit shortcutPath, @shortcutOptions, (err) ->
          logger.error('[Updater] Could not update existing shortcut', { err, shortcutPath }) is err

  deleteShortcut: (shortcutPath) ->
    logger.info('[Updater] Deleting shortcut', shortcutPath)
    if fs.existsSync(shortcutPath)
      fs.unlink(shortcutPath)
