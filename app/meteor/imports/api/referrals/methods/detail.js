export const detail = ({
  from,
  to,
  referrals,
  redeemingAppointments = [],
  futureAppointments = [],
  patients
}) => {
  const enhancedReferrals = referrals.map(r => {
    const patient = patients.find(p => p._id === r.patientId)
    if (!patient) {
      console.error('No pat for', r)
      return {}
    }

    const isPending = r => a =>
      a.patientId === r.patientId && (
        (a.calendarId === r.referredTo) ||
        (a.tags && a.tags.includes(r.referredTo))
      )

    const pendingAppointment = r.redeemingAppointmentId
      ? redeemingAppointments.find(a => a._id === r.redeemingAppointmentId)
      : futureAppointments.find(isPending(r))

    const pendingAt = pendingAppointment && pendingAppointment.createdAt
    const plannedRedeemedAt = pendingAppointment && pendingAppointment.start

    return {
      ...r,
      patient,
      pendingAt,
      plannedRedeemedAt
    }
  })

  return {
    referrals: enhancedReferrals
  }
}
