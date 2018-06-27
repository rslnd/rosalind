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
  const child = childProcess.execFile(exePath)
  child.stdout.setEncoding('utf8')

  child.stdout.on('data', d =>
    logger.info('[automation] generateEoswinReports', d)
  )

  child.stderr.on('data', d =>
    console.error('[automation] generateEoswinReports error:', d)
  )

  return new Promise((resolve, reject) => {
    child.on('close', code => {
      logger.info('[automation] generateEoswinReports exited with code', code)

      if (code !== 0) {
        logger.error('[automation] generateEoswinReports failed')
        reject(code)
      } else {
        resolve()
      }
    })
  })
}

module.exports = { start, generateEoswinReports }
