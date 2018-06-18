import map from 'lodash/map'
import some from 'lodash/some'
import union from 'lodash/union'
import reduce from 'lodash/reduce'
import moment from 'moment-timezone'

module.exports = ({ Schedules, Appointments }) ->

  eachBlock: ({ time }) ->
    appointments = Appointments.methods.findAll(time, 'block').fetch()
    available = 10 - reduce(map(appointments, (a) -> a.duration().minutes()), ((a, b) -> a + b), 0)

    block = {}
    block.isOpen = Schedules.methods.isOpen({ time })
    block.scheduled = map(Schedules.methods.getScheduled(time), (u) -> u._id)
    block.appointments = map(appointments, (a) -> a._id)
    block.available = available
    return block

  eachHour: ({ hour }) ->
    hour.isOpen = some(hour.blocks, { isOpen: true })
    hour.scheduled = union(map(hour.blocks, (m) -> m.scheduled)...)
    hour.appointments = union(map(hour.blocks, (m) -> m.appointments)...)
    return hour

  eachDay: ({ day }) ->
    day.isOpen = some(day.hours, { isOpen: true })
    day.scheduled = union(map(day.hours, (h) -> h.scheduled)...)
    day.appointments = union(map(day.hours, (h) -> h.appointments)...)
    return day
