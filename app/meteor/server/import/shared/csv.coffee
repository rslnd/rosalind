@Import ||= {}

Future = Meteor.npmRequire('fibers/future')
fs = Meteor.npmRequire('fs')
exec = Meteor.npmRequire('child_process').exec
csvParse = Meteor.npmRequire('csv-parse')
execSync = Meteor.wrapAsync(exec)

@Import.Csv = (options) ->
  options = _.defaults options,
    delete: true

  total = csvRowCount(options.path)

  options.progress.log("Csv: Parsing #{total} records") if options.progress

  totalParsed = eachRecord options.path, Meteor.bindEnvironment (row, i) ->
    options.iterator(row) if options.iterator
    if options.progress and i %% 1000 is 0
      options.progress.progress(i, total)
      options.progress.log("Csv: Parsed #{i} records")

  options.progress.log("Csv: Parsed #{totalParsed} records. Done.") if options.progress

  return totalParsed

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

  parser.on('error', (e) -> future.throw('[Import] Csv: csvParse: ' + e))
  parser.on('finish', -> future.return(i))
  parser.on 'readable', ->
    while (record = parser.read())
      i += 1
      iterator(record, i)

  fs.createReadStream(path).pipe(parser)

  future.wait()
