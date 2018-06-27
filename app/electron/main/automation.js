const childProcess = require('child_process')
const path = require('path')
const logger = require('./logger')

const start = (argv = []) => {
  if (argv.join(' ').indexOf('generateEoswinReports') !== -1) {
    generateEoswinReports()
  }
}

const generateEoswinReports = () => {
  const exePath = path.join(__dirname, '..', 'generateEoswinReports.exe')
  logger.info('[automation] Spawning', exePath)

  // Need to use execFile here because it is the only child process
  // function that transparently extracts the executable from an asar package
  return childProcess.execFile(exePath, [], {
    shell: true
  }, (err, stdout, stderr) => {
    if (err) {
      logger.error('[automation] generateEoswinReports error:', err)
    }

    if (stdout) {
      logger.info('[automation] generateEoswinReports', stdout)
    }

    if (stderr) {
      logger.info('[automation] generateEoswinReports stderr', stderr)
    }
  })
}

module.exports = { start }
