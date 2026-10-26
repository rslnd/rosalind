import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { Referrals } from '../../../api/referrals'

const alternativeCalendarId = 'msAPu96R9pjQkcNBQ'

Migrations.add({
  version: 5,

  up: async function () {
    const cursor = Patients.find({ 'external.bioresonanz.id': { $ne: null } })

    for (const patient of cursor) {
      const referral = {
        patientId: patient._id,
        createdAt: new Date(),
        redeemedAt: new Date(),
        referredTo: alternativeCalendarId,
        type: 'external'
      }

      await Referrals.insertAsync(referral)
    }

    console.log('Migration referredToAlternative: added external referrals for', await cursor.countAsync(), 'patients')

    return true
  },

  down: function () {
    return true
  }
})
