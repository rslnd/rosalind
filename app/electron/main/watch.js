const fs = require('fs')
const path = require('path')
const { ipcMain } = require('electron')
const iconv = require('iconv-lite')
const chokidar = require('chokidar')
const temp = require('temp')
const { dbfToJSON } = require('./dbfToJSON')
const { getSettings, onNewSettings } = require('./settings')
const logger = require('./logger')


// This queue keeps thunks of actions that start/stop all watchers when settings change
let actionQueue = []

const performNextAction = async () => {
  if (actionQueue[0]) {
    await actionQueue[0]()
    actionQueue = actionQueue.slice(1)
  }

  setTimeout(performNextAction, 2000)
}

performNextAction()

let watchers = []

// Only honor delete requests for files that were actually transmitted, for security
let pendingTransferPaths = []

// Some importers directly access production database files, we need to enforce { remove: false }
// and always make a copy to a temp location before accessing the file, and afterwards delete only the copy.
const criticalImporters = ['innoPatients']
const isCritical = i => (criticalImporters.indexOf(i) !== -1)

const onAdd = async ({ ipcReceiver, watch, path, importer, remove, focus }) => {
  logger.info('[Watch] New file was added', { path, watch, importer, remove, focus })

  if (isCritical(importer)) {
    path = await copyToTemp(path)
  }

  pendingTransferPaths.push(path)

  switch (importer) {
    case 'innoPatients':
      const patientsJSON = await dbfToJSON({ path })
      logger.info(`Attmepting to send ${(patientsJSON.length / 1024 / 1024).toFixed(2)} MiB over IPC`)
      return ipcReceiver.send('dataTransfer', { path, watch, content: patientsJSON, importer, remove, focus })
    default:
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
}

const start = ({ ipcReceiver, handleFocus }) => {
  onNewSettings(() =>
    actionQueue.push(async () => {
      await stop()

      setTimeout(() => {
        actionQueue.push(() =>
          startWatchers({ ipcReceiver, handleFocus })
        )
      }, 1000)
    })
  )

  actionQueue.push(async () => {
    await startWatchers({ ipcReceiver, handleFocus })
    // Only bind remove thing once
    bindRemoveAfterIngest()
  })
}

const startWatchers = async ({ ipcReceiver, handleFocus }) => {
  const settings = getSettings()
  if (settings.watch) {
    logger.info('[Watch] Watching paths', settings.watch)

    await Promise.all(settings.watch.map(async (watch) => {
      if (!watch.enabled) {
        logger.info(`[watch] Skip setting up watcher because it is not enabled: ${JSON.stringify(watch)}`)
        return
      }

      let { importer, remove } = watch

      if (isCritical(importer)) {
        remove = false // just to make sure, the temp file is deleted anyways
      }


      if (!watch.singleFile) {
        await ensureDirectoryExists(watch.path)
      }

      let watcher = chokidar.watch(watch.path, {
        persistent: true,
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        depth: 1,
        usePolling: true,
        disableGlobbing: true,
        interval: 100,
        binaryInterval: 300,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 50
        }
      })

      watcher.on('add', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))
      watcher.on('change', (path) => onAdd({ ipcReceiver, watch, path, importer, remove }))

      watchers.push(watcher)
    }))
  }
}

const stop = async () => {
  logger.info('[Watch] Stop')

  await Promise.all(watchers.map(async w => {
    if (w) {
      await Promise.all(Object.keys(w.getWatched()).map(async path => {
        await w.unwatch(path)
      }))
      await w.close()
      watchers = watchers.filter(wx => wx != w)
    }
  }))
}

// Optionally remove files after successful ingestion
const bindRemoveAfterIngest = () => {
  ipcMain.on('dataTransferSuccess', (e, { remove, path, focus }) => {
    if (pendingTransferPaths.indexOf(path) === -1) {
      logger.error('[Watch] Received success event for file that was not transferred in the current session, discarding event')
      return
    }

    // Always remove temp files, especially temp copies of critical sources
    if (path.indexOf('rosalind') !== -1 && path.indexOf('.tmp') !== -1) {
      logger.info('[Watch] Data transfer success, forcing removal of temp file', { path, remove })
      remove = true
    } else {
      logger.info('[Watch] Data transfer success', { path, remove })
    }

    if (remove) {
      logger.info('[Watch] Removing file', path)
      fs.unlink(path, (err) => {
        if (err) {
          logger.error(`[Watch] Failed to remove file ${err.message} ${err.stack}`)
        }

        // Remove deleted path from queue
        pendingTransferPaths = pendingTransferPaths.filter(p => p !== path)
      })
    }

    if (focus) {
      handleFocus()
    }
  })
}

const copyToTemp = (originalPath) => new Promise((resolve, reject) => {
  temp.track()
  temp.mkdir('rosalind', (err, tmpDir) => {
    if (err) { return reject(err) }
    const tempPath = path.join(tmpDir, Math.random().toString(36).substring(7) + '.tmp')
    fs.copyFile(originalPath, tempPath, (err) => {
      if (err) { return reject(err) }
      resolve(tempPath)
    })
  })
})

const ensureDirectoryExists = watchPath => new Promise((resolve, reject) => {
  fs.mkdir(watchPath, { recursive: true }, (err) => {
    if (err) {
      reject(err)
      return logger.error(`[Watch] Failed to create direcotry to watch ${watchPath}`)
    }

    resolve(watchPath)
  })
})

module.exports = { start, stop }
