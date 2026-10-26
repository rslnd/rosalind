export const unredeem = ({ Referrals, Appointments }) => {
  return async ({ appointmentId }) => {
    const appointment = await Appointments.findOneAsync({ _id: appointmentId })
    if (!appointment) { return false }
    const { patientId } = appointment

    if (patientId) {
      const referral = await Referrals.findOneAsync({
        patientId,
        redeemingAppointmentId: appointmentId
      })

      if (referral) {
        await Referrals.updateAsync({ _id: referral._id }, {
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
