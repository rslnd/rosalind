'use strict'

const exec = require('child_process').exec
const path = require('path')

let processes = []

const defaults = {
  ROOT_URL: 'http://0.0.0.0:3000',
  BROWSER: 'Chrome:50.0',
  OS: 'Windows 10',
  SAUCE_HOST: 'localhost',
  SAUCE_PORT: 4445
}

Object.keys(defaults).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = defaults[key]
  }
})

const startChimp = () => {
  startProcess({
    name: 'Chimp',
    command: './node_modules/.bin/chimp tests/chimp.js',
    failOnMessage: 'Not running',
    options: {
      cwd: path.resolve(path.join(__dirname, '../'))
    }
  })
}

const killProcess = (code) => {
  console.log('** Exiting with code ' + code)
  if (code === 0) {
    console.log('** Yay! All tests passed.')
  }
  processes.map((p) => p.kill())
  process.exit(code)
}

const startProcess = (opts, callback) => {
  console.log('** Running ' + opts.name)
  let proc = exec(opts.command, opts.options)
  if (opts.waitForMessage) {
    proc.stdout.on('data', (data) => {
      if (data.toString().match(opts.failOnMessage)) {
        killProcess(1)
      }
      if (data.toString().match(opts.waitForMessage)) {
        callback && callback()
      }
    })
  }

  proc.stdout.pipe(process.stdout)
  proc.stderr.pipe(process.stderr)
  proc.on('close', (code) => {
    console.log('   ' + opts.name, 'exited with code ' + code)
    if (!opts.waitForMessage && callback && code === 0) {
      callback()
    } else {
      killProcess(code)
    }
  })

  processes.push(proc)
}

startChimp()
