spawn = Meteor.npmRequire('child_process').spawn
csvParse = Meteor.npmRequire('csv-parse')

Importers.Terminiko =
  run: (@path) ->
    Winston.info('[Import] Terminiko: Running')
    @toCsv()

  toCsv: (callback) ->
    options =
      mdbExport:
        table: 'Termine'
        escape: '\\\\'
      csvParse:
        autoParse: true
        autoParseDate: true
        skip_empty_lines: true
        escape: '\\'

    mdbExport = spawn('mdb-export', ['-X', options.mdbExport.escape, '-D', '%F %T', @path, options.mdbExport.table])

    mdbExport.stdout.on 'error', Meteor.bindEnvironment (e) ->
      Winston.error('[Import] Terminiko: mdb export error', e)


    parser = csvParse(options.csvParse)

    parser.on 'error', Meteor.bindEnvironment (e) ->
      Winston.error('[Import] Terminiko: csv parsing error', e)

    parser.on 'readable', Meteor.bindEnvironment ->
      while (record = parser.read())
        {} #noop

    parser.on 'finish', Meteor.bindEnvironment ->
      Winston.info('[Import] Terminiko: csv parsing finished')

    mdbExport.stdout.pipe(parser)
