import { Events } from '../../events'
import { action } from '../../../util/meteor/action'

export const postContactForm = ({ InboundCalls, InboundCallsTopics }) =>
  action({
    name: 'inboundCalls/postContactForm',
    requireClientKey: true,
    allowAnonymous: true,
    args: {
      firstName: String,
      lastName: String,
      titlePrepend: Match.Maybe(Match.Optional(String)),
      birthdate: Match.Maybe(Match.Optional(String)),
      gender: Match.Maybe(Match.Optional(Match.OneOf('Male', 'Female', '-'))),
      telephone: Match.Maybe(Match.Optional(String)),
      email: Match.Maybe(Match.Optional(String)),

      existingPatient: Boolean,
      note: String
    },
    fn ({
      firstName,
      lastName,
      titlePrepend,
      birthdate,
      gender,
      telephone,
      email,
      existingPatient,
      note
    }) {
      const topic = InboundCallsTopics.findOne({ contactForm: true })
      const topicId = topic ? topic._id : null

      const call = {
        firstName,
        lastName,
        telephone,
        note,
        topicId,
        payload: {
          existingPatient,
          titlePrepend,
          birthdate,
          gender,
          email
        },
        createdAt: new Date()
      }

      const _id = InboundCalls.insert(call)

      Events.post('inboundCalls/postContactForm', { _id })
      return _id
    }
  })
