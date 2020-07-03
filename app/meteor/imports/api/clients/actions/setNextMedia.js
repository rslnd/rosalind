import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setNextMedia = ({ Clients }) =>
  action({
    name: 'clients/setNextMedia',
    allowAnonymous: false,
    roles: ['admin', 'patients', 'appointments-*', 'media'],
    args: {
      clientKey: String,
      patientId: Match.OneOf(null, String),
      appointmentId: Match.OneOf(null, String),
      cycle: Match.OneOf(null, String),
      tagIds: Match.OneOf(null, [String])
    },
    fn ({ clientKey, patientId, appointmentId, cycle, tagIds }) {
      const nextMedia = {
        patientId,
        appointmentId,
        cycle,
        tagIds
      }

      Clients.update({ clientKey }, {
        $set: {
          nextMedia
        }
      })

      Events.post('clients/setNextMedia', { clientKey: clientKey.substr(0, 10), nextMedia })
    }
  })
