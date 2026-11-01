// Online bookable slots (type: 'bookable') must never lie over a real
// appointment of the same column. These helpers are used by every code path
// that creates bookables (refuse) or puts an appointment somewhere (clean up).

// Real appointments: not a bookable, not a temporary lock, not canceled/removed.
const realAppointmentSelector = ({ calendarId, assigneeId, start, end, excludeIds }) => {
  const selector = {
    calendarId,
    assigneeId,
    type: { $nin: ['bookable', 'lock'] },
    canceled: { $ne: true },
    removed: { $ne: true },
    start: { $lt: end },
    end: { $gt: start }
  }
  if (excludeIds && excludeIds.length >= 1) {
    selector._id = { $nin: excludeIds }
  }
  return selector
}

// The first real appointment overlapping [start, end) in that column, if any.
export const findOverlappingAppointment = ({ Appointments, calendarId, assigneeId, start, end, excludeIds }) => {
  if (!assigneeId) { return null }
  return Appointments.findOneAsync(realAppointmentSelector({ calendarId, assigneeId, start, end, excludeIds }))
}

// Soft-remove all bookables of that column overlapping [start, end).
export const removeBookablesOverlapping = async ({ Appointments, calendarId, assigneeId, start, end, removedBy, note }) => {
  if (!assigneeId) { return 0 }

  const bookables = await Appointments.find({
    type: 'bookable',
    calendarId,
    assigneeId,
    removed: { $ne: true },
    start: { $lt: end },
    end: { $gt: start }
  }).fetchAsync()

  for (const b of bookables) {
    await Appointments.updateAsync({ _id: b._id }, {
      $set: {
        removed: true,
        removedAt: new Date(),
        removedBy,
        note: (note || 'Gelöscht, weil ein Termin hier liegt') + ' \n' + (b.note || '')
      }
    })
  }

  return bookables.length
}

// Soft-remove every bookable of that column that overlaps any real appointment
// within [from, to), eg. after appointments were moved into the column.
export const removeBookablesOverlappingAppointments = async ({ Appointments, calendarId, assigneeId, from, to, removedBy, note }) => {
  if (!assigneeId) { return 0 }

  const appointments = await Appointments.find(
    realAppointmentSelector({ calendarId, assigneeId, start: from, end: to })
  ).fetchAsync()

  let removed = 0
  for (const a of appointments) {
    removed += await removeBookablesOverlapping({
      Appointments,
      calendarId,
      assigneeId,
      start: a.start,
      end: a.end,
      removedBy,
      note: (note || 'Gelöscht, weil ein Termin hier liegt') + '. Termin: ' + a._id
    })
  }
  return removed
}

// Pure: whether a bookable overlaps any of the given real appointments.
export const overlapsAnyAppointment = (bookable, appointments) =>
  appointments.some(a =>
    a.calendarId === bookable.calendarId &&
    a.assigneeId === bookable.assigneeId &&
    a.type !== 'bookable' && a.type !== 'lock' &&
    !a.canceled && !a.removed &&
    a.start < bookable.end && a.end > bookable.start)
