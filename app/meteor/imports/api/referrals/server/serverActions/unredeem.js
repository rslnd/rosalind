export const unredeem = ({ Referrals, Appointments }) => {
  return ({ appointmentId }) => {
    const appointment = Appointments.findOne({ _id: appointmentId })
    if (!appointment) { return false }
    const { patientId } = appointment

    if (patientId) {
      const referral = Referrals.findOne({
        patientId,
        referredTo: {
          $in: [...appointment.tags, appointment.calendarId]
        },
        redeemedAt: { $ne: null }
      })

      if (referral) {
        Referrals.update({ _id: referral._id }, {
          $unset: {
            redeemedAt: true,
            redeemingAppointmentId: true
          }
        })

        console.log('[Referrals] serverActions/unredeem', referral._id)

        return true
      }
    }

    return false
  }
}
