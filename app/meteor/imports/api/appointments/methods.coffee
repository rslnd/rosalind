import moment from 'moment-timezone'
import { block } from '../../util/time/block'

module.exports = ({ Appointments }) ->

  toggleAdmitted: (_id, time) ->
    appointment = Appointments.findOne({ _id })
    return if appointment.treatedAt
    if appointment.admittedAt
      Appointments.update { _id }, $unset:
        admittedAt: ''
        admittedBy: ''
    else
      Appointments.methods.setAdmitted(_id, time)

  setAdmitted: (_id, time) ->
    Appointments.methods.stateChange(_id, time, 'admitted')

  setTreated: (_id, time) ->
    Appointments.methods.stateChange(_id, time, 'treated')

  setResolved: (_id, time) ->
    Appointments.softRemove(_id)

  stateChange: (_id, time, state) ->
    set = {}
    set[state + 'By'] = Meteor.user()._id
    set[state + 'At'] = if time then time.toDate() else moment().toDate()
    Appointments.update({ _id }, { $set: set })

  findAll: (date = moment(), within = 'day') ->
    if within is 'block'
      start = block(date).start.toDate()
      end = block(date).end.toDate()
    else
      start = moment(date).startOf(within).toDate()
      end = moment(date).endOf(within).toDate()

    selector =
      start:
        $gte: start
        $lte: end
    Appointments.find(selector, sort: { start: 1 })


  findOpen: (date, within = 'day') ->
    if within is 'block'
      start = block(date).start.toDate()
      end = block(date).end.toDate()
    else
      start = moment(date).startOf(within).toDate()
      end = moment(date).endOf(within).toDate()

    selector =
      admittedAt: null
      admittedBy: null
      treatedAt: null
      treatedBy: null
      start:
        $gte: start
        $lte: end
    Appointments.find(selector, sort: { start: 1 })


  findAdmitted: (date) ->
    selector =
      admittedAt: { $ne: null }
      admittedBy: { $ne: null }
      treatedAt: null
      treatedBy: null
      start:
        $gte: moment(date).startOf('day').toDate()
        $lte: moment(date).endOf('day').toDate()
    Appointments.find(selector, sort: { admittedAt: 1 })


  findTreating: (date) ->
    selector =
      admittedAt: { $ne: null }
      admittedBy: { $ne: null }
      treatedAt: { $ne: null }
      treatedBy: { $ne: null }
      start:
        $gte: moment(date).startOf('day').toDate()
        $lte: moment(date).endOf('day').toDate()
    Appointments.find(selector, sort: { treatedAt: 1 })
