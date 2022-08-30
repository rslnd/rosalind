import identity from 'lodash/identity'
import { action } from '../../../../util/meteor/action'
import { Appointments } from '../../../appointments'


export const getLoyalty = ({ Patients }) =>
  action({
    name: 'patients/getLoyalty',
    args: {
      patientId: String
    },
    roles: ['appointments-*', 'patients'],
    fn: function ({ patientId }) {
      this.unblock()

      const patient = Patients.findOne({ _id: patientId })
      const appts = Appointments.find({ patientId }, {
        sort: { start: 1 },
        fields: { revenue: 1, start: 1, admittedAt: 1, treatedAt: 1 }
      }).fetch()

      const patientSinceCandidates = [
        patient.patientSince,
        (appts[0] && appts[0].start)
      ].filter(identity)

      const patientSince = (patientSinceCandidates.length >= 1)
        ? new Date(Math.min(...patientSinceCandidates))
        : null

      const totalRevenue = (
        appts.reduce((acc, a) => {
          if (a.admittedAt || a.treatedAt) {
            return acc + (a.revenue || 0)
          } else {
            return acc
          }
        }, 0)
        + (patient.externalRevenue || 0)
      )

      const loyalty = {
        patientSince,
        totalRevenue,
        patientId
      }

      return loyalty
    }
  })
