const includes = require('lodash/includes')
const { app, session, BrowserWindow, Menu } = require('electron')
const path = require('path')
const temp = require('temp')
const openFile = require('open')
const logger = require('./logger')
const { getSettings } = require('./settings')
const { captureException } = require('@sentry/electron')

// IMPORTANT: Keep in sync with preload.js
const isUrlValid = urlString => {
  try {
    const url = new URL(urlString)
    const isValid = !!(
      url.origin.match(/^https:\/\/.*\.fxp\.at$/) ||
      (process.env.NODE_ENV === 'development' && url.origin.match(/^http:\/\/localhost:3000$/))
    )
    if (!isValid) {
      logger.error(`[Window] isUrlValid failed check: '${urlString}' - origin '${url.origin}' not valid`)
      return false
    } else {
      return true
    }
  } catch (e) {
    logger.error(`[Window] isUrlValid failed parse: ${urlString}`, e)
    return false
  }
}

const open = (callback) => {
  const { screen } = require('electron')
  const settings = getSettings()
  const display = screen.getPrimaryDisplay().workAreaSize

  app.on('web-contents-created', (event, contents) => {
    contents.on('context-menu', (event, props) => {
      const {
        canPaste,
        canCut,
        canCopy,
        isEditable
      } = props.editFlags
      const isText = props.selectionText.trim().length >= 1

      const menu = [
        {
          id: 'selectAll',
          role: 'selectAll',
          visible: isText,
          enabled: isText
        },
        {
          id: 'cut',
          role: 'cut',
          visible: canCut && isEditable,
          enabled: canCut && isEditable
        },
        {
          id: 'copy',
          role: 'copy',
          visible: canCopy,
          enabled: canCopy
        },
        {
          id: 'paste',
          role: 'paste',
          visible: canPaste && isEditable,
          enabled: canPaste && isEditable
        },
        {
          id: 'separator',
          type: 'separator' // type is not a typo here haha
        },
        {
          id: 'undo',
          role: 'undo'
        },
        {
          id: 'redo',
          role: 'redo'
        }
      ]

      Menu.buildFromTemplate(menu).popup(webContents)
    })

    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload
      delete webPreferences.preloadURL

      // Disable Node.js integration
      webPreferences.nodeIntegration = false

      // Deny, or verify URL being loaded
      event.preventDefault()

      logger.info('[Window] Denied attaching webview', params)
    })

    contents.on('will-navigate', (event, navigationUrl) => {
      if (!isUrlValid(navigationUrl)) {
        event.preventDefault()
        logger.info('[Window] Denied navigation to', navigationUrl)
      }
    })

    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault()
      logger.info('[Window] Denied opening new window', navigationUrl)
    })

    temp.mkdir('rosalind-attachments', (err, tmpDir) => {
      if (err) { throw err }
      contents.session.on('will-download', (e, item) => {
        const filePath = path.join(tmpDir, item.getFilename())
        logger.info('[Window] will-download', filePath)

        const parts = filePath.split('.')
        const ext = (parts[parts.length - 1] || ')')
        const safeExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png']
        if (safeExts.includes(ext.toLowerCase())) {
          logger.info('[Window] safe ext, will open after download')
          item.setSavePath(filePath)
          item.once('done', (e, state) => {
            if (state === 'completed') {
              logger.error('[Window] Download completed, opening')
              openFile(filePath)
            } else {
              logger.error('[Window] Download failed', state)
            }
          })
        }
      })
    })
  })

  const ephemeralSession = session
    .fromPartition('in-memory')
    .setPermissionRequestHandler((webContents, permission, grantPermission) => {
      // Deny all
      grantPermission(false)
    })

  const mainWindow = new BrowserWindow({
    x: display.x,
    y: display.y,
    width: display.width,
    height: display.height,
    minWidth: 560,
    minHeight: 426,
    title: 'Connecting',
    icon: settings.iconPath || undefined,
    disableAutoHideCursor: true,
    backgroundColor: '#ecf0f5',
    webPreferences: {
      preload: require.resolve('../renderer/preload'),
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      session: ephemeralSession,
      textAreasAreResizable: false,
      subpixelFontScaling: true,
      overlayScrollbars: false,
      webgl: false,
      webaudio: false,
      safeDialogs: true
    }
  })

  mainWindow.maximize()

  mainWindow.on('closed', () =>
    app.quit()
  )

  mainWindow.on('unresponsive', () =>
    logger.warn('[Window] Unresponsive')
  )

  const webContents = mainWindow.webContents

  if (includes(process.argv, '--dev')) {
    webContents.openDevTools()
  }

  let callbackCalled = false
  webContents.on('did-finish-load', () => {
    if (!callbackCalled) {
      callbackCalled = true
      callback(null)
    }
  })

  webContents.on('devtools-opened', () => {
    logger.warn('[Window] Developer Tools opened')
  })

  webContents.on('devtools-closed', () => {
    logger.warn('[Window] Developer Tools closed')
  })

  webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedUrl, isMainFrame) => {
    const message = logger.error('[Window] Failed to load', { event, errorCode, errorDescription, validatedUrl, isMainFrame })
    captureException(new Error(message))
    callback(new Error('did-fail-load'))
  })

  webContents.on('crashed', (event, isKilled) => {
    const message = logger.error('[Window] Crashed', { event, isKilled })
    captureException(new Error(message))
    callback(new Error('crashed'))
  })

  webContents.on('plugin-crashed', (event, name, version) => {
    const message = logger.error('[Window] Plugin crashed', { event, name, version })
    captureException(new Error(message))
    callback(new Error('plugin-crashed'))
  })

  webContents.on('certificate-error', (event, url, error, certificate) => {
    const message = logger.error('[Window] Certificate error', { event, url, error, certificate })
    captureException(new Error(message))
    callback(new Error('certificate-error'))
  })

  // DEBUG
  // webContents.on('console-message', (event, level, message, line, sourceId) => {
  //   logger.info('[Console]', message, sourceId, line)
  // })

  if (isUrlValid(settings.url)) {
    mainWindow.loadURL(settings.url)
  } else {
    logger.error(new Error('[Window] Refusing to load invalid origin'))
  }

  return mainWindow
}

module.exports = { open }
