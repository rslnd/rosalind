{ spawn, exec } = Meteor.npmRequire('child_process')
temp = Meteor.npmRequire('temp').track()
fs = Meteor.npmRequire('fs')
Future = Meteor.npmRequire('fibers/future')
csvParse = Meteor.npmRequire('csv-parse')
execSync = Meteor.wrapAsync(exec)

Meteor.startup ->
  Job.processJobs 'import', 'terminiko', (job, callback) ->
    job.log('Terminiko: Running')

    options =
      path: job.data.path
      table: 'Termine'

    path = mdbToCsv(options)
    total = csvRowCount(path)

    job.log("Terminiko: Upserting #{total} appointments")

    totalImported = eachRecord path, Meteor.bindEnvironment (row, i) ->
      job.progress(i, total) if i %% 1000 is 0

    job.log("Terminiko: csv parsing finished, upserted #{totalImported} appointments")
    job.done() and callback()

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

  mdbExport.stdout.on('error', (e) -> future.throw('[Import] Terminiko: mdbExport: ' + e))
  mdbExport.stderr.on('data', future.throw)

  tmpCsv = temp.createWriteStream()
  mdbExport.stdout
    .on 'end', -> future.return(tmpCsv.path)
    .pipe(tmpCsv)

  future.wait()

csvRowCount = (path) ->
  separator = String.fromCharCode(30)
  size = execSync("grep -o #{separator} #{path} | wc -l")
  parseInt(size)

eachRecord = (path, iterator) ->
  future = new Future()

  options =
    autoParse: true
    autoParseDate: true
    skip_empty_lines: true
    escape: '\\'
    rowDelimiter: String.fromCharCode(30)

  parser = csvParse(options)
  i = 0

  parser.on('error', (e) -> future.throw('[Import] Terminiko: csvParse: ' + e))
  parser.on('finish', -> future.return(i))
  parser.on 'readable', ->
    while (record = parser.read())
      i += 1
      iterator(record, i)

  fs.createReadStream(path).pipe(parser)

  future.wait()
