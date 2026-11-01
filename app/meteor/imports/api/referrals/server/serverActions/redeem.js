export const redeem = ({ Referrals, Appointments }) => {
  return async ({ appointmentId }) => {
    const appointment = await Appointments.findOneAsync({ _id: appointmentId })
    if (!appointment) { return false }

    if (!appointment.revenue || appointment.revenue === 0) {
      console.log('[Referrals] serverActions/redeem: Skipped redeeming appointment', appointment._id, 'because its revenue is zero')
      return false
    }

    const { patientId } = appointment

    if (patientId) {
      const referral = await Referrals.findOneAsync({
        patientId,
        referredTo: {
          $in: [...(appointment.tags || []), appointment.calendarId]
        },
        redeemedAt: null
      })

      if (referral) {
        await Referrals.updateAsync({ _id: referral._id }, {
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
