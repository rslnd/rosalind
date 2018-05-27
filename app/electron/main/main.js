const path = require('path')
module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'))

const { app, ipcMain } = require('electron')
const require('./debugger')
const updater = require('./updater')
const window = require('./window')
const logger = require('./logger')
const systemInfo = require('./systemInfo')

logger.start()

const settings = require('./settings')
const cli = require('./cli')
const print = require('./print')
const shortcuts = require('./shortcuts')
const watch = require('./watch')

let mainWindow = null

const focus = () => {
  if (!mainWindow) { return }
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.focus()
}

const start = () => {
  if (updater.handleStartupEvent()) { return }
  if (cli.handleStartupEvent(focus)) { return app.quit() }

  app.on('ready', () => {
    mainWindow = window.open(err => {
      if (err) {
        logger.error('[Main] Could not load main window', err)
        return
      }
      
      logger.ready('[Main] Main window loaded')
      watch.start({ ipcReceiver: mainWindow })
      print.start({ ipcReceiver: mainWindow })
      shortcuts.updateShortcuts()

      ipcMain.on('window/load', (e) => {
        settings.send({ ipcReceiver: mainWindow })
        updater.sendVersion({ ipcReceiver: mainWindow })
        systemInfo.send({ ipcReceiver: mainWindow })
      }
    }

    updater.start()
    setTimeout(updater.check, 5 * 1000)
    setInterval(updater.check, 5 * 60 * 1000)
  }

  app.on('window-all-closed', () => {
    updater.quitAndInstall()
    watch.stop()
    app.quit()
  })
}

start()
