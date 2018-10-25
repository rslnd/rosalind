const fs = require('fs')
const iconv = require('iconv-lite')
const chokidar = require('chokidar')
const settings = require('./settings')
const logger = require('./logger')

let watchers = []

const onAdd = ({ ipcReceiver, watch, path, importer, remove, focus }) => {
  logger.info('[Watch] New file was added', { path, watch, importer, remove, focus })

  fs.readFile(path, (err, buffer) => {
    if (err) { return logger.error('[Watch] Error reading file to buffer', err) }

    if (watch.encoding || !watch.binary) {
      const encoding = watch.encoding || 'ISO-8859-1'
      logger.info('[Watch] Transferring file with encoding', { path, encoding })
      const content = iconv.decode(buffer, encoding)
      ipcReceiver.send('import/dataTransfer', { path, watch, content, importer, remove, focus })
    } else {
      logger.info('[Watch] Transferring file as binary', { path })
      ipcReceiver.send('import/dataTransfer', { path, watch, buffer, importer, remove, focus })
    }
  })
}

const start = ({ ipcReceiver, handleFocus }) => {
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
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 500
        }
      })

      watcher.on('add', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))
      watcher.on('change', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))

      return watcher
    })

    const { ipcMain } = require('electron')
    ipcMain.on('import/dataTransferSuccess', (e, { remove, path, focus }) => {
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
