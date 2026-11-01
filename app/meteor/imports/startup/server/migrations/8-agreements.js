import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { Appointments } from '../../../api/appointments'

const privacy = [
  'dsg',
  'dsv',
  'dsgv',
  'dsgvo'
]

const accepted = [
  'ok',
  'unterschrieben',
  'akzeptiert'
]

const hasAccepted = note => {
  const n = note.toLowerCase()

  let ok = false
  privacy.map(a =>
    accepted.map(b => {
      if (ok) {

      } else {
        ok = n.indexOf([a, b].join(' ')) !== -1
      }
    })
  )

  return ok
}

Migrations.add({
  version: 8,

  up: async function () {
    let agreedCount = 0
    ;await Promise.all((await Patients.find({}).fetchAsync()).map(async p => {
      const ok = p.note && hasAccepted(p.note)
      if (!ok) { return }

      agreedCount++

      const lastAppointment = await Appointments.find({
        patientId: p._id
      }, {
        sort: { start: -1 },
        limit: 1
      }).fetchAsync()

      const lastAppointmentDate = lastAppointment[0] && lastAppointment[0].start

      await Patients.updateAsync({ _id: p._id }, {
        $set: {
          agreements: [
            {
              to: 'privacy',
              agreedAt: lastAppointmentDate || p.createdAt || p.patientSince || new Date()
            }
          ]
        }
      })
    }))

    console.log(`Parsed ${agreedCount} agreements`)
    return true
  },

  down: function () {
    return true
  }
})
