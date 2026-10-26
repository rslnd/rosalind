import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { Referrals } from '../../../api/referrals'

const cosmeticsCalendarId = 'XrK3jfwdzqMCHZ5N9'

Migrations.add({
  version: 4,

  up: async function () {
    await Patients.find({ patientSince: { $ne: null } }).forEachAsync(async patient => {
      const referral = {
        patientId: patient._id,
        createdAt: new Date(),
        redeemedAt: patient.patientSince,
        referredTo: cosmeticsCalendarId,
        type: 'external'
      }

      await Referrals.insertAsync(referral)
    })
    return true
  },

  down: function () {
    return true
  }
})
