import * as Api from '../../api'
import { MongoInternals } from 'meteor/mongo'
import { Accounts } from 'meteor/accounts-base'
import { pseudonyms } from '../../util/pseudonyms'
import { normalizeName } from '../../api/patients/util/normalizeName'

export default () => {
  process.on('warning', e => {
    console.warn('[Server] Node process warning')
    console.warn(e.name)
    console.warn(e.message)
    console.warn(e.stack)
  })

  process.on('unhandledRejection', (exception, promise) => {
    console.error('[Server] Node unhandled promise rejection', exception, exception.stack, promise)
  })

  // Fiber.poolSize = 1e9;

  // if (process.env.ENABLE_TRACE || process.env.NODE_ENV === 'development') {
  //   setInterval(() => {
  //     const { rss, heapTotal, heapUsed } = process.memoryUsage()
  //     const { fibersCreated, poolSize } = Fiber

  //     console.log({ rss, heapTotal, heapUsed, fibersCreated, poolSize })
  //   }, 20 * 1000).unref()
  // }

  const Mongo = MongoInternals.defaultRemoteCollectionDriver().mongo
  const db = Mongo.db
  const multiplexers = Mongo._observeMultiplexers

  db.s.topology.on('close', e => {
    console.error('[Debug] Database topology change: closed')
    console.log(`Number of observes are active: ${Object.keys(multiplexers).length}`)
  })

  db.s.topology.on('reconnect', data =>
    console.log('[Debug] Database topology change: Successfully reconnected to mongo'))

  db.s.topology.on('reconnectFailed', data =>
    console.error('[Debug] Database topology change: Failed to reconnect to mongo'))

  db.s.topology.on('left', data =>
    console.log('[Debug] Database topology change: A server left the replica set'))

  db.s.topology.on('joined', data =>
    console.log('[Debug] Database topology change: A server joined the replica set'))

  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api


  const anonymizeInDevlopment = process.env.DANGER_IRREVOCABLY_ANONYMIZE_PERSONAL_DATA_FOR_DEMO
  if (anonymizeInDevlopment && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging')) {
    console.log('Anonymizing data')

    const randomName = () =>
      pseudonyms[Math.floor(Math.random() * (pseudonyms.length - 1))]

    Api.Users.find({}).fetch().forEach(({_id}) => {
      Api.Users.update({ _id }, {
        $set: {
          lastName: randomName(),
          firstName: randomName(),
        }
      })
    })

    // turn one original (admin) user into a demo user
    if (process.env.DEMO_USERNAME_ORIGINAL) {
      Accounts.setPassword(Api.Users.findOne({ username: process.env.DEMO_USERNAME_ORIGINAL })._id, process.env.DEMO_PASSWORD, { logout: false })
      Api.Users.update({ username: 'az' }, {
        $set: {
          username: process.env.DEMO_USERNAME
        }
      })
    }

    Api.Settings.remove({ key: 'messages.sms.fxpsms.host' })
    Api.Settings.remove({ key: 'messages.sms.provider' })
    Api.Settings.remove({ key: 'messages.sms.websms.password' })
    Api.Settings.remove({ key: 'messages.sms.websms.username' })
    Api.Settings.remove({ key: 'messages.sms.fxpsms.token' })
    Api.Settings.remove({ key: 'messages.sms.fxpsms.token.hzw' })
    Api.Settings.remove({ key: 'messages.sms.whitelist.numbers' })
    Api.Settings.remove({ key: 'media.s3.config' })
    Api.Settings.remove({ key: 'media.s3.secrets' })
    Api.Settings.remove({ isPublic: { $ne: true} })

    Api.Settings.set('messages.sms.enabled', false)
    Api.Settings.set('primaryColor', '#3c4fbc')
    

    Api.InboundCallsTopics.find({}).fetch().forEach(({_id}) => {
      const name = randomName()
      Api.InboundCallsTopics.update({ _id }, {
        $set: {
          label: 'Dr. ' + name,
          labelShort: 'Dr. ' + name,
          slug: name.toLowerCase(),
        }
      })
    })


    const patientsBatch = Api.Patients.rawCollection().initializeUnorderedBulkOp()
    Api.Patients.find({}, { fields: { _id: 1 } }).fetch().forEach(({ _id }) => {
      const lastName = randomName()
      patientsBatch.find({ _id }).updateOne({
        $set: {
          lastName,
          lastNameNormalized: normalizeName(lastName),
          firstName: randomName(),
          note: 'Allergien: Latex, Effortil',
          contacts: [
            { channel: 'Phone', value: '+43 000 000 0000' }
          ],
          address: {
            line1: 'Musterstraße 1/1',
            postalCode: '1030',
            locality: 'Wien'
          },
          patientSince: new Date(2013, 9, 12),
          insuranceId: '1234000000',
          external: {}
        }
      })
    })
    Meteor.wrapAsync(patientsBatch.execute, patientsBatch)()

    const callsBatch = Api.InboundCalls.rawCollection().initializeUnorderedBulkOp()
    Api.InboundCalls.find({}, { fields: { _id: 1 } }).fetch().forEach(({ _id }) => {
      const lastName = randomName()
      callsBatch.find({ _id }).updateOne({
        $set: {
          lastName,
          firstName: randomName(),
          note: 'Anfrage wegen XYZ',
          telephone: '+43 0000 0000 000'
        }
      })
    })
    Meteor.wrapAsync(callsBatch.execute, callsBatch)()

    const commentsBatch = Api.Comments.rawCollection().initializeUnorderedBulkOp()
    Api.Comments.find({}, { fields: { _id: 1 } }).fetch().forEach(({ _id }) => {
      commentsBatch.find({ _id }).updateOne({
        $set: {
          body: 'Anmerkung ABC',
        }
      })
    })
    Meteor.wrapAsync(commentsBatch.execute, commentsBatch)()

    const messagesBatch = Api.Messages.rawCollection().initializeUnorderedBulkOp()
    Api.Messages.find({}, { fields: { _id: 1 } }).fetch().forEach(({ _id }) => {
      messagesBatch.find({ _id }).updateOne({
        $set: {
          text: 'SMS-Mustertext',
          from: '+43 000 000 000',
          to: '+43 000 000 000',
          payload: {}
        }
      })
    })
    Meteor.wrapAsync(messagesBatch.execute, messagesBatch)()


    const appointmentsBatch = Api.Appointments.rawCollection().initializeUnorderedBulkOp()
    Api.Appointments.find({}, { fields: { _id: 1 } }).fetch().forEach(({ _id }) => {
      const lastName = randomName()
      appointmentsBatch.find({ _id }).updateOne({
        $set: {
          note: 'Anmerkung zu Behandlung ABC',
        }
      })
    })
    Meteor.wrapAsync(appointmentsBatch.execute, appointmentsBatch)()


    console.log('Done')
  }
}
