import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setCurrentPatient = ({ Clients }) =>
  action({
    name: 'clients/setCurrentPatient',
    allowAnonymous: false,
    roles: ['admin', 'patients', 'appointments-*', 'media'],
    args: {
      clientKey: String,
      patientId: Match.OneOf(null, String)
    },
    fn ({ clientKey, patientId }) {
      if (patientId) {
        Clients.update({ clientKey }, {
          $set: {
            currentPatientId: patientId
          }
        })
      } else {
        Clients.update({ clientKey }, {
          $unset: {
            currentPatientId: 1
          }
        })
      }

      Events.post('clients/setCurrentPatient', { clientKey: clientKey.substr(0, 10), patientId })
    }
  })
