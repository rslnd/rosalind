import { spawn } from 'child_process'
import temp from 'temp'
import fs from 'fs'
Future = Npm.require('fibers/future')
import csv from './csv'

module.exports = (options) ->
  temp.track()

  options = _.defaults options,
    delete: true
    columnDelimiter: ','
    rowDelimiter: '\n'

  options.progress.log('Mdb: Converting mdb to csv') if options.progress

  mdbPath = options.path
  csvPath = mdbToCsv(options)

  options.path = csvPath

  options.progress.log('Mdb: Parsing csv') if options.progress

  totalParsed = csv(options)

  options.progress.log("Mdb: Parsed #{totalParsed} records. Done.") if options.progress

  fs.unlinkSync(mdbPath) if options.delete

  return totalParsed

mdbToCsv = (options) ->
  future = new Future()

  options = _.defaults options,
    escape: String.fromCharCode(27)
    date: '%F %T'

  mdbExport = spawn 'mdb-export', [
    '-X', options.escape
    '-D', options.date
    '-d', options.columnDelimiter
    # '-R', options.rowDelimiter
    options.path
    options.table
  ]

  mdbExport.stdout.on('error', (e) -> future.throw('[Import] Mdb: mdbExport: ' + e))
  mdbExport.stderr.on('data', (e, d) -> future.throw('[Import] Mdb: mdbExport: ' + e))

  tmpCsv = temp.createWriteStream()
  mdbExport.stdout
    .on 'end', -> future.return(tmpCsv.path)
    .pipe(tmpCsv)

  future.wait()
