import { Events } from '../../events'
import { action } from '../../../util/meteor/action'

export const post = ({ InboundCalls }) =>
  action({
    name: 'inboundCalls/post',
    roles: ['inboundCalls', 'admin', 'inboundCalls-*'],
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
    },
    fn ({
      kind,
      note,
      topicId,
      pinnedBy,
      privatePatient,
      lastName,
      firstName,
      telephone,
      patient,
      payload
    }) {
      const call = {
        kind,
        note,
        topicId,
        pinnedBy,
        privatePatient,
        payload
      }

      if (kind === 'other') {
        const _id = InboundCalls.insert({
          ...call,
          lastName,
          firstName,
          telephone
        })

        Events.post('inboundCalls/post', { _id })
        return _id
      } else if (kind === 'patient') {
        const { patientId, ...patientFields } = patient

        if (!patientId) {
          throw new Meteor.Error('patientId is required when kind is patient')
        }

        if (patientId === 'newPatient') {
          const newPatientId = Meteor.call('patients/upsert', {
            patient: patientFields
          })

          const _id = InboundCalls.insert({
            ...call,
            patientId: newPatientId
          })

          Events.post('inboundCalls/post', { _id })
          return _id
        } else {
          const existingPatientId = Meteor.call('patients/upsert', {
            patient: {
              ...patientFields,
              _id: patientId
            }
          })

          const _id = InboundCalls.insert({
            ...call,
            patientId: existingPatientId
          })

          Events.post('inboundCalls/post', { _id })
          return _id
        }
      }
    }
  })
