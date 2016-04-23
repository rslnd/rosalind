path = require 'path'
fs = require 'fs'
{ exec } = require 'child_process'

processes = []

unless process.env.ROOT_URL
  console.error('Please set ROOT_URL')
  process.exit(1)

startChimp = ->
  startProcess
    name: 'Chimp'
    command: chimpCommand()
    failOnMessage: 'Not running'

chimpCommand = ->
  chimp = [
    './node_modules/.bin/chimp'
    '--ddp=' + process.env.ROOT_URL
    '--path=app/meteor/tests/cucumber/features/'
    '--browser=chrome'
    '--compiler=coffee:coffee-script/register'
  ]

  if process.env.CUCUMBER_JSON_OUTPUT
    chimp.push '--jsonOutput=' + process.env.CUCUMBER_JSON_OUTPUT

  if process.env.SAUCE_HOST
    chimp.push '--user=' + process.env.SAUCE_USERNAME
    chimp.push '--key=' + process.env.SAUCE_ACCESS_KEY
    chimp.push '--host=' + process.env.SAUCE_HOST
    chimp.push '--port=' + process.env.SAUCE_PORT

    if process.env.SAUCE_NAME
      chimp.push '--name="' + process.env.SAUCE_NAME + '"'
    else
      chimp.push '--name="Rosalind WIP"'


  chimp.join(' ')


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
