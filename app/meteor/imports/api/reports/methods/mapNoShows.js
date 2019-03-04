import intersectionBy from 'lodash/fp/intersectionBy'
import negate from 'lodash/fp/negate'
import mapValues from 'lodash/fp/mapValues'
import uniqBy from 'lodash/fp/uniqBy'

const isNoShow = a => a.patientId && !a.admittedAt && !a.canceledAt
const isCanceled = a => a.patientId && a.canceledAt

export const mapNoShows = ({ messages = [], appointments = [] }) => {
  appointments = uniqBy('patientId', appointments.filter(a => a.patientId))
  const remindedAppointmentIds = messages.map(m => m.type === 'appointmentReminder' && m.payload && m.payload.appointmentId)
  const isReminded = (a) => remindedAppointmentIds.includes(a._id)

  const reminded = appointments.filter(isReminded)
  const notReminded = appointments.filter(negate(isReminded))
  const canceled = appointments.filter(isCanceled)
  const noShows = appointments.filter(isNoShow)

  const remindedCanceled = intersectionBy('_id')(reminded, canceled)
  const remindedNoShow = intersectionBy('_id')(reminded, noShows)

  const notRemindedCanceled = intersectionBy('_id')(notReminded, canceled)
  const notRemindedNoShow = intersectionBy('_id')(notReminded, noShows)

  const values = {
    remindedCanceled,
    notRemindedCanceled,
    remindedNoShow,
    notRemindedNoShow,
    reminded,
    notReminded,
    canceled,
    noShows
  }

  return mapValues(x => ((x && x.length) || null))(values)
}
