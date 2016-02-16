Meteor.startup ->
  Appointments.setAdmitted = (id, time) ->
    Appointments.stateChange(id, time, 'admitted')

  Appointments.setTreated = (id, time) ->
    Appointments.stateChange(id, time, 'treated')

  Appointments.setResolved = (id, time) ->
    Appointments.softRemove(id)

  Appointments.stateChange = (id, time, state) ->
    set = {}
    set[state + 'By'] = Meteor.user()._id
    set[state + 'At'] = if time then time.toDate() else moment().toDate()
    Appointments.update(id, { $set: set })


  Appointments.findOpen = (date) ->
    selector =
      admittedAt: null
      admittedBy: null
      treatedAt: null
      treatedBy: null
      start:
        $gte: moment(date).startOf('day').toDate()
        $lte: moment(date).endOf('day').toDate()
    Appointments.find(selector, sort: { start: 1 })


  Appointments.findAdmitted = (date) ->
    selector =
      admittedAt: { $ne: null }
      admittedBy: { $ne: null }
      treatedAt: null
      treatedBy: null
      start:
        $gte: moment(date).startOf('day').toDate()
        $lte: moment(date).endOf('day').toDate()
    Appointments.find(selector, sort: { admittedAt: 1 })


  Appointments.findTreating = (date) ->
    selector =
      admittedAt: { $ne: null }
      admittedBy: { $ne: null }
      treatedAt: { $ne: null }
      treatedBy: { $ne: null }
      start:
        $gte: moment(date).startOf('day').toDate()
        $lte: moment(date).endOf('day').toDate()
    Appointments.find(selector, sort: { treatedAt: 1 })

  Appointments.isAvailable = (options) ->
    Schedules.isAvailable(options)
