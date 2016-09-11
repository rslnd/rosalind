const fs = require('fs')
const iconv = require('iconv-lite')
const chokidar = require('chokidar')
const settings = require('./settings')
const logger = require('./logger')

let watchers = []

const onAdd = ({ ipcReceiver, watch, path }) => {
  logger.info('[Watch] New file was added', { path, watch })

  fs.readFile(path, (err, buffer) => {
    if (err) { return logger.error('[Watch] Error reading file to buffer', err) }

    if (watch.encoding || !watch.binary) {
      const encoding = watch.encoding || 'ISO-8859-1'
      logger.info('[Watch] Transferring file with encoding', { path, encoding })
      const content = iconv.decode(buffer, encoding)
      ipcReceiver.send('import/dataTransfer', { path, watch, content })
    } else {
      logger.info('[Watch] Transferring file as binary', { path })
      ipcReceiver.send('import/dataTransfer', { path, watch, buffer })
    }
  })
}

const start = ({ ipcReceiver }) => {
  if (settings.watch) {
    logger.info('[Watch] Watching paths', settings.watch)

    watchers = settings.watch.map((watch) => {
      let watcher = chokidar.watch(watch.path, {
        persistent: true,
        ignored: /[\/\\]\./,
        depth: 0,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 500
        }
      })

      watcher.on('add', (path) => onAdd({ ipcReceiver, watch, path }))
      watcher.on('change', (path) => onAdd({ ipcReceiver, watch, path }))

      return watcher
    })
  }
}

const stop = () => {
  logger.info('[Watch] Start')

  watchers.forEach((watcher) => {
    if (watcher) {
      watcher.close()
    }
  })
}

module.exports = { start, stop }
