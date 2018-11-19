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
        return
      } else {
        ok = n.indexOf([a, b].join(' ')) !== -1
      }
    })
  )

  return ok
}

Migrations.add({
  version: 8,

  up: function () {
    let agreedCount = 0
    Patients.find({}).fetch().map(p => {
      const ok = p.note && hasAccepted(p.note)
      if (!ok) { return }

      agreedCount++

      const lastAppointment = Appointments.find({
        patientId: p._id
      }, {
        sort: { start: -1 },
        limit: 1
      }).fetch()

      const lastAppointmentDate = lastAppointment[0] && lastAppointment[0].start

      Patients.update({ _id: p._id }, {
        $set: {
          agreements: [
            {
              to: 'privacy',
              agreedAt: lastAppointmentDate || p.createdAt || p.patientSince || new Date()
            }
          ]
        }
      })
    })

    console.log(`Parsed ${agreedCount} agreements`)
    return true
  },

  down: function () {
    return true
  }
})
