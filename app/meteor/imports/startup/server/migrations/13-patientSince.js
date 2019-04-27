import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { dayToDate } from '../../../util/time/day'

const up = () => {
  const patients = Patients.find({ note: { $ne: null } }).fetch()

  console.log('[Migration]', patients.length, 'patients with note to parse')

  patients.forEach((patient, i) => {
    if ((i % 1000) === 0) {
      console.log('[Migration] Progress', i, 'of', patients.length)
    }

    const dateInNote = patient.note.match(/\b\d{6}\b/)

    if (dateInNote && dateInNote[0]) {
      let [_, dd, mm, yy] = dateInNote[0].match(/(\d{2})(\d{2})(\d{2})/)

      dd = parseInt(dd, 10)
      mm = parseInt(mm, 10)
      yy = parseInt(yy, 10)

      if (yy <= 19) {
        yy += 2000
      } else {
        yy += 1900
      }

      const day = {
        day: dd,
        month: mm,
        year: yy
      }

      const patientSince = dayToDate(day)

      const newNote = patient.note.replace(dateInNote[0], '').trim()

      try {
        Patients.update({ _id: patient._id }, {
          $set: {
            patientSince,
            note: newNote
          }
        })
      } catch (e) {
        console.error('[Migration] Failed to migrate patient', patient._id, dateInNote[0], day)
      }
    }
  })

  return true
}

const down = () => {
  return true
}

Migrations.add({
  version: 13,
  up,
  down
})
