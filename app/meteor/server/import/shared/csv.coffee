@Import ||= {}

fs = Meteor.npmRequire('fs')
csv = Meteor.npmRequire('babyparse')
iconv = Meteor.npmRequire('iconv-lite')
exec = Meteor.npmRequire('child_process').exec
execSync = Meteor.wrapAsync(exec)
temp = Meteor.npmRequire('temp').track()


@Import.Csv = (options) ->
  options = _.defaults options,
    delete: true
    encoding: 'utf8'
    progressFactor: 1

  approxTotal = csvRowCount(options)
  options.progress.log("Csv: Parsing #{approxTotal} records") if options.progress


  parsed = []
  totalParsed = 0

  csvOptions =
    delimiter: options.columnDelimiter
    newline: options.rowDelimiter
    header: true
    dynamicTyping: true
    skipEmptyLines: true
    fastMode: false
    step: (record) ->
      record = record.data[0]
      record = options.iterator(record)

      if options.progress and parsed.length %% 10000 is 0
        options.progress.log("Csv: Parsed #{totalParsed} records") if options.progress
        options.progress.progress(Math.floor(totalParsed * options.progressFactor), approxTotal)

      if options.bulk
        parsed.push(record) if record

        if parsed.length >= 1000
          options.bulk(parsed)
          parsed = []

      totalParsed++


  if options.reverseParse
    reversedPath = temp.openSync().path
    execSync("head -n1 #{options.path} > #{reversedPath}; tail -n+2 #{options.path} | tac >> #{reversedPath}")
    file = fs.readFileSync(reversedPath)
  else
    file = fs.readFileSync(options.path)

  file = iconv.decode(file, options.encoding)

  csv.parse(file, csvOptions)

  options.bulk(parsed) if options.bulk and parsed.length > 0

  options.progress.log("Csv: Parsed #{totalParsed} records. Done.") if options.progress

  fs.unlinkSync(options.path) if options.delete
  fs.unlinkSync(reversedPath) if options.reverseParse

  return totalParsed


csvRowCount = (options) ->
  size = execSync("wc -l #{options.path}")
  parseInt(size)
