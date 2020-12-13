const path = require('path')
module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'))

const { app, Menu, ipcMain, crashReporter } = require('electron')
const { init } = require('@sentry/electron')

const SENTRY_DSN_URL = 'https://6af65eb19a37410f968d4e602ce572d7@sentry.io/62218'
const SENTRY_CRASH_URL = 'https://sentry.io/api/62218/minidump?sentry_key=6af65eb19a37410f968d4e602ce572d7'

init({
  appName: 'Rosalind Electron Main',
  dsn: SENTRY_DSN_URL,
  enableNative: false,
  release: app.getVersion()
})

crashReporter.start({
  companyName: 'Fixpoint Systems GmbH',
  productName: 'Rosalind Electron Main',
  ignoreSystemCrashHandler: true,
  submitURL: SENTRY_CRASH_URL,
  compress: true
})

process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = true

const logger = require('./logger')
logger.start()

app.on('ready', () => {
  Menu.setApplicationMenu(null)
  app.setAppUserModelId('com.rslnd.rosalind')

  const { getSettings } = require('./settings')

  const updater = require('./updater')
  const window = require('./window')
  const systemInfo = require('./systemInfo')

  const cli = require('./cli')
  const automation = require('./automation')
  const print = require('./print')
  const watch = require('./watch')
  const devtools = require('./devtools')
  const { ensureClientKey } = require('./clientKey')

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

  if (cli.handleStartupEvent(handleOtherInstanceLaunched)) { return app.quit() }

  mainWindow = window.open(err => {
    if (err) {
      logger.error('[Main] Could not load main window', err)
      return
    }

    logger.ready('[Main] Main window loaded')
    print.start({ ipcReceiver: mainWindow.webContents })
    automation.start(process.argv)
    devtools.start()
  })

  ipcMain.on('hello', (e) => {
    logger.info('IPC received hello, sending welcome')

    ensureClientKey((clientKey) => {
      mainWindow.webContents.send('welcome', {
        systemInfo,
        clientKey
      })

      // Some watchers fire immediately even for files that are already present,
      // delay their initialization to avoid perceptible lag or "unauthorized" errors
      // when racing against client key authn
      setTimeout(() => {
        watch.start({ ipcReceiver: mainWindow.webContents, handleFocus })
      }, 2500)
    })
  })

  updater.start({ ipcReceiver: mainWindow.webContents })
  setTimeout(updater.check, 5 * 1000)
  setInterval(updater.check, 5 * 60 * 1000)

  app.on('window-all-closed', () => {
    watch.stop()
    app.quit()
  })
})
