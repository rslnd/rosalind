import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { Referrals } from '../../../api/referrals'

const cosmeticsCalendarId = 'XrK3jfwdzqMCHZ5N9'

Migrations.add({
  version: 4,

  up: function () {
    Patients.find({ patientSince: { $ne: null } }).forEach(patient => {
      const referral = {
        patientId: patient._id,
        createdAt: new Date(),
        redeemedAt: patient.patientSince,
        referredTo: cosmeticsCalendarId,
        type: 'external'
      }

      Referrals.insert(referral)
    })
    return true
  },

  down: function () {
    return true
  }
})
