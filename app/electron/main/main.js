const path = require('path')
module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'))

const { app, ipcMain, crashReporter } = require('electron')
const { init } = require('@sentry/electron')

const SENTRY_DSN_URL = 'https://6af65eb19a37410f968d4e602ce572d7@sentry.io/62218'
const SENTRY_CRASH_URL = 'https://sentry.io/api/62218/minidump?sentry_key=6af65eb19a37410f968d4e602ce572d7'

init({
  dsn: SENTRY_DSN_URL,
  enableNative: false,
  release: app.getVersion()
})

crashReporter.start({
  companyName: 'Rosalind',
  productName: 'Rosalind',
  ignoreSystemCrashHandler: true,
  submitURL: SENTRY_CRASH_URL
})

const logger = require('./logger')
logger.start()

const start = () => {
  app.on('ready', () => {
    const updater = require('./updater')
    const window = require('./window')
    const systemInfo = require('./systemInfo')
    const settings = require('./settings')
    const cli = require('./cli')
    const automation = require('./automation')
    const print = require('./print')
    const shortcuts = require('./shortcuts')
    const watch = require('./watch')
    const devtools = require('./devtools')

    let mainWindow = null

    const handleFocus = () => {
      if (!mainWindow) { return }
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }

    const handleOtherInstanceLaunched = (argv) => {
      handleFocus()
      automation.start(argv)
    }

    if (updater.handleStartupEvent()) { return }
    if (cli.handleStartupEvent(handleOtherInstanceLaunched)) { return app.quit() }

    mainWindow = window.open(err => {
      if (err) {
        logger.error('[Main] Could not load main window', err)
        return
      }

      logger.ready('[Main] Main window loaded')
      watch.start({ ipcReceiver: mainWindow, handleFocus })
      print.start({ ipcReceiver: mainWindow })
      automation.start(process.argv)
      shortcuts.updateShortcuts()
      devtools.start()

      ipcMain.on('window/load', (e) => {
        settings.send({ ipcReceiver: mainWindow })
        updater.sendVersion({ ipcReceiver: mainWindow })
        systemInfo.send({ ipcReceiver: mainWindow })
      })
    })

    updater.start()
    setTimeout(updater.check, 5 * 1000)
    setInterval(updater.check, 5 * 60 * 1000)

    app.on('window-all-closed', () => {
      updater.quitAndInstall()
      watch.stop()
      app.quit()
    })
  })
}

start()
