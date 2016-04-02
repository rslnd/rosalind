@Import ||= {}
@Import.Terminiko ||= {}

@Import.Terminiko.findPatientId = (options) ->
  record = options.record

  if record.Patient_Id and record.Patient_Id > 0
    patientId = findPatientId(options)
    return { patientId } if patientId

  patientId = fuzzyFindPatientId(parseFreetext(record.Info))

  if patientId
    return { patientId, heuristic: true }
  else
    return {}


findPatientId = (options) ->
  patient = Patients.findOne
    'external.terminiko.id': options.record.Patient_Id?.toString()
  if patient
    return new MongoInternals.NpmModule.ObjectID(patient._id._str)

fuzzyFindPatientId = (options) ->
  should = []

  if options.phone
    should.push term:
      'profile.contacts.value':
        value: options.phone

  if options.insuranceId
    should.push term:
      insuranceId:
        value: options.insuranceId

  if options.fullName
    should.push match:
      'profile.fullName':
        query: options.fullName
        slop: 0
        fuzziness: 0

  patient = Search.queryExactlyOne 'patients',
    query:
      bool:
        should: should
        minimum_number_should_match: 2

  return new MongoInternals.NpmModule.ObjectID(patient._id) if patient

parseFreetext = (freetext) ->
  return {} unless freetext
  freetext = freetext.toString()
  return {} if freetext.length < 4

  numbers = Helpers.zerofix(freetext)
    .split(/(\s|\,|\/|\-)/).join('')
    .match(/\d+/)

  parsed = {}

  if numbers
    for number in numbers
      if number?.length is 10
        parsed.insuranceId = number
      if number?.length > 4
        parsed.phone = number

  name = freetext.split(/\d+/).join(' ')
  parsed.name = name if name.length > 4

  return parsed
