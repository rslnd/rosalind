import intersectionBy from 'lodash/fp/intersectionBy'
import negate from 'lodash/fp/negate'
import mapValues from 'lodash/mapValues'

const isNoShow = a => a.patientId && !a.admittedAt && !a.canceledAt
const isCanceled = a => a.patientId && a.canceledAt

export const mapNoShows = ({ messages = [], appointments = [] }) => {
  const remindedAppointmentIds = messages.map(m => m.type === 'appointmentReminder' && m.payload && m.payload.appointmentId)
  const isReminded = (a) => remindedAppointmentIds.includes(a._id)

  const reminded = appointments.filter(isReminded)
  const notReminded = appointments.filter(negate(isReminded))
  const canceled = appointments.filter(isCanceled)
  const noShow = appointments.filter(isNoShow)

  const remindedCanceled = intersectionBy('_id')(reminded, canceled)
  const remindedNoShow = intersectionBy('_id')(reminded, noShow)

  const notRemindedCanceled = intersectionBy('_id')(notReminded, canceled)
  const notRemindedNoShow = intersectionBy('_id')(notReminded, noShow)

  const values = {
    remindedCanceled,
    notRemindedCanceled,
    remindedNoShow,
    notRemindedNoShow,
    reminded,
    notReminded,
    canceled,
    noShow
  }

  return mapValues(values, () => 0) // x => x && x.length
}
