{ Patients } = require 'api/patients'

findPatientId = (options) ->
  patient = Patients.findOne
    'external.terminiko.id': options.record.Patient_Id?.toString()
  if patient
    return patient._id


module.exports = (options) ->
  record = options.record

  if record.Patient_Id and record.Patient_Id > 0
    patientId = findPatientId(options)
    if patientId
      return { patientId }
    else
      return {}
  else
    return {}
