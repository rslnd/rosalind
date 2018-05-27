const fsx = require('fs-extra')
const shortcut = require('windows-shortcuts-appid')
const logger = require('./logger')
const settings = require('./settings')
const manifest = require('./manifest')

const shortcutPaths = [
  process.env.APPDATA + '\\Microsoft\\Windows\\Start Menu\\Programs\\' + settings.customer.name + '.lnk',
  process.env.USERPROFILE + '\\Desktop\\' + settings.customer.name + '.lnk'
]

const shortcutOptions = {
  target: process.execPath,
  runStyle: shortcut.MAX,
  desc: manifest.productName + ' v' + manifest.version,
  args: '',
  icon: process.execPath
}

const updateShortcuts = () => {
  if (process.platform !== 'win32') { return }
  logger.info('[Update] Updating shortcuts')

  return Promise.all(shortcutPaths.map((shortcutPath) => {
    return new Promise((resolve, reject) => {
      fsx.pathExists(shortcutPath)
        .then((exists) => {
          if (exists) {
            return resolve(updateShortcut(shortcutPath))
          } else {
            return resolve(createShortcut(shortcutPath))
          }
        })
    })
  }))
}

const deleteShortcuts = () => {
  if (process.platform !== 'win32') { return }
  logger.info('[Update] Deleting shortcuts')

  return Promise.all(shortcutPaths.map((shortcutPath) => {
    return deleteShortcut(shortcutPath)
  }))
}

const createShortcut = (shortcutPath) => {
  return new Promise((resolve, reject) => {
    logger.info('[Updater] Creating new shortcut', shortcutPath)
    shortcut.create(shortcutPath, shortcutOptions, (err) => {
      if (err) {
        logger.error('[Updater] Could not create shortcut', { err, shortcutPath })
        return reject(err)
      }

      logger.info('[Updater] Created shortcut', shortcutPath)
      shortcut.addAppId(shortcutPath, manifest.appId, (err) => {
        if (err) {
          logger.error('[Updater] Could not link app id', err)
          return reject(err)
        }

        resolve()
      })
    })
  })
}

const updateShortcut = (shortcutPath, callback) => {
  return new Promise((resolve, reject) => {
    logger.info('[Updater] Querying existing shortcut', shortcutPath)
    shortcut.query(shortcutPath, (err, info) => {
      if (err) {
        logger.error('[Updater] Could not query existing shortcut', { err, shortcutPath })
        return reject(err)
      }

      const existingTarget = info.expanded.target || info.target
      if (existingTarget !== shortcutOptions.target) {
        logger.info('[Updater] Updating existing shortcut', shortcutPath)
        shortcut.edit(shortcutPath, shortcutOptions, (err) => {
          if (err) {
            logger.error('[Updater] Could not update existing shortcut', { err, shortcutPath })
            reject(err)
          }
        })
      } else {
        resolve()
      }
    })
  })
}

const deleteShortcut = (shortcutPath) => {
  logger.info('[Updater] Deleting shortcut', shortcutPath)
  return fsx.remove(shortcutPath)
}

module.exports = { updateShortcuts, deleteShortcuts }
