@Import ||= {}

spawn = Meteor.npmRequire('child_process').spawn
temp = Meteor.npmRequire('temp').track()
fs = Meteor.npmRequire('fs')
Future = Meteor.npmRequire('fibers/future')

@Import.Mdb = (options) ->
  options = _.defaults options,
    delete: true

  mdbPath = options.path
  csvPath = mdbToCsv(options)

  options.path = csvPath

  totalParsed = Import.Csv(options)

  options.progress.log("Mdb: Parsed #{totalParsed} records. Done.") if options.progress

  fs.unlinkSync(mdbPath) if options.delete

  return totalParsed

mdbToCsv = (options) ->
  future = new Future()

  options = _.defaults options,
    escape: '\\\\'
    date: '%F %T'
    separator: String.fromCharCode(30)

  mdbExport = spawn 'mdb-export', [
    '-X', options.escape
    '-D', options.date
    '-R', options.separator
    options.path
    options.table
  ]

  mdbExport.stdout.on('error', (e) -> future.throw('[Import] Mdb: mdbExport: ' + e))
  mdbExport.stderr.on('data', future.throw)

  tmpCsv = temp.createWriteStream()
  mdbExport.stdout
    .on 'end', -> future.return(tmpCsv.path)
    .pipe(tmpCsv)

  future.wait()
