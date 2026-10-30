import { Events } from '../../events'
import { action, Match } from '../../../util/meteor/action'
import { Patients } from '../../patients'
import { normalizePhoneNumber } from '../../messages/methods/normalizePhoneNumber'
import moment from 'moment-timezone'

export const auerPhone = ({ InboundCalls }) =>
  action({
    name: 'inboundCalls/auerPhone',
    allowAnonymous: true,
    requireClientKey: true,
    args: {
      calls: [{
        id: Number,
        datum: String,
        startZeit: String,
        dauer: String,
        extName: String,
        extRufNr: String,
        msn: String,
        dir: Match.OneOf(1, 0), // 0=incoming 1=outgoing

        // Unofficial fields augmented in electron/main/auerPhone,
        // these are empty string if the call was not answered
        tnNrRechnung: String,
        tnNameRechnung: String,
        tnNrReal: String,
        tnNameReal: String,
        anschlussNr: String,
        abrgArt: String
      }]
    },
    async fn ({ calls }) {
      const lastInserted = await InboundCalls.findOneAsync(
        { 'external.auerPhone.id': { $ne: null } },
        { sort: { 'external.auerPhone.id': -1 }, removed: true } // include removed to avoid respawning
      )

      const lastInsertedId = lastInserted ? lastInserted.external.auerPhone.id : null

      const missedCalls = calls.filter(c =>
        c.dir === 0 &&
        lastInsertedId ? (c.id > lastInsertedId) : true &&
        (
          (
            c.tnNrRechnung === '' &&
            c.tnNameRechnung === '' &&
            c.tnNrReal === '' &&
            c.tnNameReal === '' &&
            c.anschlussNr === ''
          ) ||
          (
            c.abrgArt.indexOf('vergebl') !== -1
          )
        )
      )

      const inboundCalls = await Promise.all(missedCalls.map(async c => {

        const normalizedTel = c.extRufNr && normalizePhoneNumber(c.extRufNr)
        const patient = normalizedTel ? await Patients.findOneAsync({ 'contacts.valueNormalized': normalizedTel }) : null

        const createdAt = moment.tz(
          [c.datum, c.startZeit].join(' '),
          'DD.MM.YY hh:mm:ss',
          'Europe/Vienna'
        ).toDate()

        return {
          kind: patient ? 'patient' : 'other',
          telephone: c.extRufNr,
          note: 'Verpasster Anruf',
          patientId: patient ? patient._id : undefined,
          createdAt,
          payload: c,
          external: {
            auerPhone: {
              id: c.id,
              timestamps: {
                importedAt: new Date()
              }
            }
          }
        }
      }))

      // console.log(inboundCalls)
      const ids = await Promise.all(inboundCalls.map(async c => await InboundCalls.insertAsync(c)))

      console.log(`[inboundCalls] auerPhone: Inserting ${missedCalls.length} calls: ${JSON.stringify(ids)}`)

      return ids
    }
  })
