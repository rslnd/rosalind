const fs = require('fs')
const iconv = require('iconv-lite')
const chokidar = require('chokidar')
const { getSettings, onNewSettings } = require('./settings')
const logger = require('./logger')

let watchers = []

// Only honor delete requests for files that were actually transmitted, for security
let pendingTransferPaths = []

const onAdd = ({ ipcReceiver, watch, path, importer, remove, focus }) => {
  logger.info('[Watch] New file was added', { path, watch, importer, remove, focus })
  pendingTransferPaths.push(path)

  fs.readFile(path, (err, buffer) => {
    if (err) { return logger.error('[Watch] Error reading file to buffer', err) }

    if (watch.encoding || !watch.binary) {
      const encoding = watch.encoding || 'ISO-8859-1'
      logger.info('[Watch] Transferring file with encoding', { path, encoding })
      const content = iconv.decode(buffer, encoding)
      ipcReceiver.send('dataTransfer', { path, watch, content, importer, remove, focus })
    } else {
      logger.info('[Watch] Transferring file as base64', { path })
      const base64 = buffer.toString('base64')
      ipcReceiver.send('dataTransfer', { path, watch, base64, importer, remove, focus })
    }
  })
}

const start = ({ ipcReceiver, handleFocus }) => {
  onNewSettings(() => {
    stop()

    setTimeout(() => {
      startWatchers({ ipcReceiver, handleFocus })
    }, 5000)
  })

  startWatchers({ ipcReceiver, handleFocus })
}

const startWatchers = ({ ipcReceiver, handleFocus }) => {
  const settings = getSettings()
  if (settings.watch) {
    logger.info('[Watch] Watching paths', settings.watch)

    watchers = settings.watch.map((watch) => {
      if (!watch.enabled) { return }

      const { importer, remove } = watch

      let watcher = chokidar.watch(watch.path, {
        persistent: true,
        ignored: /[/\\]\./,
        depth: 0,
        usePolling: true,
        disableGlobbing: true,
        interval: 50,
        binaryInterval: 50,
        awaitWriteFinish: {
          stabilityThreshold: 101,
          pollInterval: 30
        }
      })

      watcher.on('add', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))
      watcher.on('change', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))

      return watcher
    })

    const { ipcMain } = require('electron')
    ipcMain.on('dataTransferSuccess', (e, { remove, path, focus }) => {
      if (pendingTransferPaths.indexOf(path) === -1) {
        logger.error('[Watch] Received success event for file that was not transferred in the current session, discarding event')
        return
      }

      logger.info('[Watch] Data transfer success', { path, remove })
      if (remove) {
        logger.info('[Watch] Removing file', path)
        fs.unlink(path, (err) => {
          if (err) {
            logger.error(`[Watch] Failed to remove file ${err.message} ${err.stack}`)
          }
        })
      }

      if (focus !== false) {
        handleFocus()
      }
    })
  }
}

const stop = () => {
  logger.info('[Watch] Stop')

  watchers.forEach((watcher) => {
    if (watcher) {
      watcher.close()
    }
  })
}

module.exports = { start, stop }
