import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { Referrals } from '../../../api/referrals'

const alternativeCalendarId = 'msAPu96R9pjQkcNBQ'

Migrations.add({
  version: 5,

  up: function () {
    const cursor = Patients.find({ 'external.bioresonanz.id': { $ne: null } })

    cursor.forEach(patient => {
      const referral = {
        patientId: patient._id,
        createdAt: new Date(),
        redeemedAt: new Date(),
        referredTo: alternativeCalendarId,
        type: 'external'
      }

      Referrals.insert(referral)
    })

    console.log('Migration referredToAlternative: added external referrals for', cursor.count(), 'patients')

    return true
  },

  down: function () {
    return true
  }
})
