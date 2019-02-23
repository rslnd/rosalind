export const redeem = ({ Referrals, Appointments }) => {
  return ({ appointmentId }) => {
    const appointment = Appointments.findOne({ _id: appointmentId })
    if (!appointment) { return false }

    if (!appointment.revenue || appointment.revenue === 0) {
      console.log('[Referrals] serverActions/redeem: Skipped redeeming appointment', appointment._id, 'because its revenue is zero')
      return false
    }

    const { patientId } = appointment

    if (patientId) {
      const referral = Referrals.findOne({
        patientId,
        referredTo: {
          $in: [...(appointment.tags || []), appointment.calendarId]
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

        console.log('[Referrals] serverActions/redeem', referral._id)

        return true
      }
    }

    return false
  }
}
