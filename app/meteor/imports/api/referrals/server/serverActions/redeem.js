export const redeem = ({ Referrals, Appointments }) => {
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
        redeemedAt: null
      })

      if (referral) {
        Referrals.update({ _id: referral._id }, {
          $set: {
            redeemedAt: new Date(),
            redeemingAppointmentId: appointment._id
          }
        })

        console.log('[Referrals] serverActions/redeem', referral)

        return true
      }
    }

    return false
  }
}
