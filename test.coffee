path = require 'path'
fs = require 'fs'
{ exec } = require 'child_process'
each = require 'lodash/each'

processes = []

defaults =
  ROOT_URL: 'http://0.0.0.0:3000'
  BROWSER: 'Chrome:50.0'
  OS: 'Windows 10'
  SAUCE_HOST: 'localhost'
  SAUCE_PORT: 4445

each defaults, (v, k) ->
  process.env[k] = v unless process.env[k]

startChimp = ->
  startProcess
    name: 'Chimp'
    command: './node_modules/.bin/chimp'
    failOnMessage: 'Not running'

killProcess = (code) ->
  console.log('** Exiting with code ' + code)
  console.log('** Yay! All tests passed.') if code is 0
  p.kill() for p in processes
  process.exit(code)

startProcess = (opts, callback) ->
  console.log('** Running ' + opts.name)
  proc = exec(opts.command, opts.options)
  if opts.waitForMessage
    proc.stdout.on 'data', (data) ->
      if data.toString().match(opts.failOnMessage)
        killProcess(1)
      if data.toString().match(opts.waitForMessage)
        callback() if callback

  proc.stdout.pipe(process.stdout)
  proc.stderr.pipe(process.stderr)
  proc.on 'close', (code) ->
    console.log('   ' + opts.name, 'exited with code ' + code)
    if not opts.waitForMessage and callback and code is 0
      callback()
    else
      killProcess(code)

  processes.push(proc)

startChimp()
