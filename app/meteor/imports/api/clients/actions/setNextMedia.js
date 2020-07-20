import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setNextMedia = ({ Clients }) =>
  action({
    name: 'clients/setNextMedia',
    allowAnonymous: false,
    roles: ['admin', 'patients', 'appointments-*', 'media'],
    args: {
      clientKey: String,
      patientId: Match.Maybe(Match.OneOf(undefined, null, String)),
      appointmentId: Match.Maybe(Match.OneOf(undefined, null, String)),
      cycle: Match.Maybe(Match.OneOf(undefined, null, String)),
      tagIds: Match.Maybe(Match.OneOf(undefined, null, [String]))
    },
    requireClientKey: true,
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
