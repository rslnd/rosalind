import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setCurrentView = ({ Clients }) =>
  action({
    name: 'clients/setCurrentView',
    allowAnonymous: false,
    roles: ['admin', 'patients', 'appointments-*', 'media'],
    args: {
      clientKey: String,
      patientId: Match.OneOf(null, String),
      appointmentId: Match.OneOf(null, String)
    },
    fn ({ clientKey, patientId, appointmentId }) {
      Clients.update({ clientKey }, {
        $set: {
          currentPatientId: patientId,
          currentAppointmentId: appointmentId
        }
      })

      Events.post('clients/setCurrentView', { clientKey: clientKey.substr(0, 10), patientId, appointmentId })
    }
  })
