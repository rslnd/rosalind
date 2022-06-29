import { Events } from '../../events'
import { action, Match } from '../../../util/meteor/action'
import { safeMediaTypes } from '../../../util/schema'

export const setChecked = ({ Checkups, CheckupsRules }) =>
  action({
    name: 'checkups/setChecked',
    roles: ['admin', 'checkups', 'checkups-edit'],
    args: {
      kind: Match.OneOf('patient', 'other'),
      note: String,
      topicId: Match.Maybe(Match.OneOf(undefined, null, String)),
      pinnedBy: Match.Maybe(Match.Optional(String)),
      privatePatient: Match.Maybe(Match.Optional(Boolean)),

      lastName: Match.Maybe(Match.Optional(String)),
      firstName: Match.Maybe(Match.Optional(String)),
      telephone: Match.Maybe(Match.Optional(String)),

      patient: Match.Maybe(Match.Optional(Object)),
      payload: Match.Maybe(Match.Optional(Object)),
      attachment: Match.Maybe(Match.Optional({
        b64: String,
        mediaType: Match.OneOf(...safeMediaTypes),
        size: Number,
        name: String
      })),
    },
    fn ({
      
    }) {
      Events.post('checkups/setChecked', {})
    }
  })
