Meteor.startup ->
  Appointments.helpers
    privateOrInsurance: ->
      if @privateAppointment
        TAPi18n.__('appointments.private')
      else
        TAPi18n.__('appointments.insurance')

    open: ->
      not @admittedAt? and not @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

    admitted: ->
      @admittedAt? and @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

    treated: ->
      @admittedAt? and @admittedBy? and @treatedAt? and @treatedBy? and not @removed


    patient: ->
      Patients.findOne(_id: new Mongo.ObjectID(@patientId._str)) if @patientId?._str

    assignee: ->
      Meteor.users.findOne(_id: @assigneeId)

    notes: ->
      n = [@note, @external?.terminiko?.note]
      return _.filter(n, (s) -> s and s.length >= 1).join('\n')

    collection: ->
      Appointments
