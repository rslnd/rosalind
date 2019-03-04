const { app } = require('electron')
const logger = require('./logger')

const handleStartupEvent = callback => {
  const apiVersion =
    app.requestSingleInstanceLock
      ? 4
      : 3

  // Only quit newer instance if current one is non-headless.
  // Inversely, quit the older current instance if it was headless.
  const isHeadless = process.argv.join(' ').indexOf('headless') !== -1
  let isSecondInstance = null

  const handleOtherInstanceLaunched = (argv, cwd) => {
    logger.info('[CLI] Other instance was launched', 'cwd:', cwd, 'argv:', argv)
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
  }

  if (apiVersion === 4) {
    isSecondInstance = !app.requestSingleInstanceLock()

    app.on('second-instance', (e, argv = [], cwd) => {
      handleOtherInstanceLaunched(argv, cwd)
    })
  } else {
    isSecondInstance = app.makeSingleInstance((argv, cwd) => {
      handleOtherInstanceLaunched(argv, cwd)
    })
  }

  if (isSecondInstance && !isHeadless) {
    logger.info('[CLI] Quitting because other instance is already running')
    return true
  }
}

module.exports = {
  handleStartupEvent
}
