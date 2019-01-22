const { app } = require('electron')
const logger = require('./logger')

const handleStartupEvent = callback => {
  const gotTheLock = app.requestSingleInstanceLock()

  app.on('second-instance', (argv, cwd) => {
    logger.info('[CLI] Other instance was launched in', cwd, argv)

    // Quit old instance when headless is started
    const isHeadless =
      process.argv.join(' ').indexOf('headless') !== -1 ||
      argv.join(' ').indexOf('headless') !== -1

    if (isHeadless) {
      logger.info('[CLI] Quitting old instance because it was running headless or a new headless instance was started')
      app.quit()
    } else {
      callback(argv, cwd)
    }
  })

  // Only quit newer instance if it is not headless
  const isHeadless = process.argv.join(' ').indexOf('headless') !== -1
  if (!gotTheLock && !isHeadless) {
    logger.info('[CLI] Quitting because other instance is already running')
    return true
  }
}

module.exports = {
  handleStartupEvent
}
