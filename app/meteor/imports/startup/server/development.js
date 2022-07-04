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

    Api.Users.find({}, { removed: true }).fetch().forEach(({ _id, username }) => {
      Api.Users.update({ _id }, {
        $set: {
          lastName: randomName(),
          firstName: randomName(),
          $unset: {
            services: 1
          }
        }
      })
    })

    // turn one original (admin) user into a demo user
    if (process.env.DEMO_USERNAME_ORIGINAL && process.env.DEMO_USERNAME) {
      if (Api.Users.findOne({ username: process.env.DEMO_USERNAME_ORIGINAL })) {
        Accounts.setPassword(Api.Users.findOne({ username: process.env.DEMO_USERNAME_ORIGINAL })._id, process.env.DEMO_PASSWORD, { logout: false })
        Api.Users.update({ username: 'az' }, {
          $set: {
            username: process.env.DEMO_USERNAME
          }
        })
      } else {
        console.error('Error: DEMO_USERNAME_ORIGINAL user not found: ' + process.env.DEMO_USERNAME_ORIGINAL)
      }
    }

    if (process.env.DEMO_USERNAME && Api.Users.findOne({ username: process.env.DEMO_USERNAME })) {
      Accounts.setPassword(Api.Users.findOne({ username: process.env.DEMO_USERNAME })._id, process.env.DEMO_PASSWORD, { logout: false })
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

    Api.Settings.insert({
      key: 'logo.svg',
      isPublic: true,
      value: 'value',
      base64Image: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNzRweCIgaGVpZ2h0PSI3NnB4IiB2aWV3Qm94PSIwIDAgNzQgNzYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDc0IDc2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xLjQ2LDUuNzhjNC45OSw4LjcsMi44MiwxOS40Miw3LjU1LDI4LjJjMi44OCw1LjU3LDcuOTEsMTAuMzUsMTQuMTQsMTEuNzk5DQoJYzMuODYsMS4wNDEsNy44OSwxLjIyMSwxMS44NiwxLjVjMC40Myw3Ljc0LDAuNDgsMTUuNSwwLjA2LDIzLjI0QzIzLjc3LDcwLjU5LDEzLjYzLDYzLjIzLDguNzEsNTMuMzINCglDMS4zNiwzOC43MywwLjMxLDIxLjgxLDEuNDYsNS43OHoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik02OC44MiwyMC44NWMwLjM0LTUuMjMsMS42MDktMTAuMzUsMy44NS0xNS4wOWMxLjMxMSwxMi4zNSwwLjMyLDI0Ljk3OS0yLjg5MSwzNi45OA0KCUM2Ny4wNSw1Mi4zLDYyLjA0LDYyLjA3LDUzLjAxLDY3LjAyOWMtNC4xOTksMi42MDEtOS4xOCwzLjI2MS0xMy45Niw0LjA2MWMtMC40NC03LjkyLTAuMzktMTUuODQsMC4wMTEtMjMuNzYNCgljNi42NDktMC40MywxNC0wLjUyLDE5LjQzOS00LjkyQzY1LjEyLDM3LjMyLDY4LjE0MSwyOC45NCw2OC44MiwyMC44NXoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zMy40NiwyMi41YzQuMDktMS4zOCw5LjEzLTAuMzIsMTEuODMsMy4yYzMuOTEsNC43MywyLjUyMSwxMi43OC0yLjk1LDE1LjY5DQoJYy00LjY4LDIuNzk5LTExLjI0LDEtMTQuMTUtMy41MTFDMjUuMDEsMzIuNiwyNy4yMywyNC4zNSwzMy40NiwyMi41eiIvPg0KPC9zdmc+DQo=',
    })

    Api.Settings.insert({
      key: 'favicon.ico',
      isPublic: true,
      value: 'value',
      base64Image: 'data:image/vnd.microsoft.icon;base64,AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCmDlmgq/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5ZoKIOWaCs/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCs/lmgogAAAAAAAAAAAAAAAA5ZoKIOWaCu/lmgr/5ZoK/+/AZv/yzYX/6Kcp/+qtOP/12aP/78Bm/+WaCv/lmgr/5ZoK7+WaCiAAAAAAAAAAAOWaCs/lmgr/56AZ//nmwv///////////+yzR//ss0f////////////67NH/56AZ/+WaCv/lmgrPAAAAAOWaCmDlmgr/5ZoK//ffsv/////////////////ss0f/7LNH//////////////////nmwv/lmgr/5ZoK/+WaCmDlmgq/5ZoK/+qtOP//////////////////////7LNH/+yzR///////////////////////6q04/+WaCv/lmgq/5ZoK/+WaCv/005T///////nmwv/tulf/6Kcp/+WaCv/noBn/7LNH/+26V//55sL///////TTlP/lmgr/5ZoK/+WaCv/lmgr/+ebC//ffsv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK//nmwv/67NH/5ZoK/+WaCv/lmgr/5ZoK///////opyn/5ZoK/+WaCv/wxnX/+ebC//nmwv/qrTj/5ZoK/+WaCv/opyn//////+WaCv/lmgr/5ZoK/+WaCv/9+fD/5ZoK/+WaCv/ss0f//////////////////fnw/+WaCv/lmgr/5ZoK//zy4P/lmgr/5ZoK/+WaCr/lmgr/+ebC/+WaCv/lmgr/8s2F///////////////////////ss0f/5ZoK/+WaCv/55sL/7LNH/+WaCr/lmgpg5ZoK//TTlP/lmgr/5ZoK/+yzR//////////////////9+fD/5ZoK/+WaCv/lmgr/9NOU/+egGf/lmgpgAAAAAOWaCs/noBn/5ZoK/+WaCv/lmgr/8s2F//nmwv/337L/6q04/+WaCv/lmgr/5ZoK/+inKf/lmgrPAAAAAAAAAADlmgog5ZoK7+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgrv5ZoKIAAAAAAAAAAAAAAAAOWaCiDlmgrP5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgrP5ZoKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCmDlmgq/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgpgAAAAAAAAAAAAAAAAAAAAAPAPAADAAwAAgAEAAIABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAACAAQAAwAMAAPAPAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCjDlmgqA5ZoKv+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgqA5ZoKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCmDlmgrP5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoKz+WaCmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCiDlmgq/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADlmgpQ5ZoK7+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCu/lmgpQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5ZoKYOWaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+inKf/qrTj/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaClDlmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/ss0f/99+y//358P//////7LNH/+WaCv/lmgr/8s2F////////////99+y/+/AZv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgpQAAAAAAAAAAAAAAAAAAAAAAAAAADlmgog5ZoK7+WaCv/lmgr/5ZoK/+WaCv/noBn/99+y///////////////////////yzYX/5ZoK/+WaCv/yzYX///////////////////////nmwv/noBn/5ZoK/+WaCv/lmgr/5ZoK/+WaCu/lmgogAAAAAAAAAAAAAAAAAAAAAOWaCr/lmgr/5ZoK/+WaCv/lmgr/56AZ//rs0f////////////////////////////LNhf/lmgr/5ZoK//LNhf////////////////////////////358P/opyn/5ZoK/+WaCv/lmgr/5ZoK/+WaCr8AAAAAAAAAAAAAAADlmgpg5ZoK/+WaCv/lmgr/5ZoK/+WaCv/67NH/////////////////////////////////8s2F/+WaCv/lmgr/8s2F//////////////////////////////////rs0f/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCmAAAAAAAAAAAOWaCs/lmgr/5ZoK/+WaCv/lmgr/8s2F///////////////////////////////////////yzYX/5ZoK/+WaCv/yzYX///////////////////////////////////////LNhf/lmgr/5ZoK/+WaCv/lmgr/5ZoKzwAAAADlmgow5ZoK/+WaCv/lmgr/5ZoK/+egGf/9+fD//////////////////////////////////////+/AZv/lmgr/5ZoK//LNhf///////////////////////////////////////fnw/+egGf/lmgr/5ZoK/+WaCv/lmgr/5ZoKMOWaCoDlmgr/5ZoK/+WaCv/lmgr/78Bm////////////////////////////////////////////7LNH/+WaCv/lmgr/8s2F////////////////////////////////////////////8s2F/+WaCv/lmgr/5ZoK/+WaCv/lmgqA5ZoKv+WaCv/lmgr/5ZoK/+WaCv/67NH//////////////////fnw//TTlP/tulf/7LNH/+WaCv/lmgr/5ZoK/+WaCv/opyn/7LNH/+yzR//wxnX/99+y///////////////////////88uD/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgr/5ZoK/+WaCv/lmgr/56AZ//////////////////XZo//noBn/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/56AZ//ffsv/////////////////opyn/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/tulf////////////12aP/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK//XZo////////////+/AZv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK//LNhf///////PLg/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/56AZ//zy4P//////9NOU/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/+ebC///////vwGb/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/56AZ/+/AZv/yzYX/8s2F/+qtOP/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/78Bm///////55sL/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/55sL//////+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+qtOP/9+fD///////////////////////XZo//lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr//fnw//358P/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK///////55sL/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/opyn//fnw//////////////////////////////////LNhf/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/55sL//////+WaCv/lmgr/5ZoK/+WaCv/lmgq/5ZoK/+WaCv/lmgr///////TTlP/lmgr/5ZoK/+WaCv/lmgr/5ZoK//TTlP///////////////////////////////////////fnw/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK//LNhf//////5ZoK/+WaCv/lmgr/5ZoKv+WaCoDlmgr/5ZoK/+WaCv//////8s2F/+WaCv/lmgr/5ZoK/+WaCv/lmgr/+ebC////////////////////////////////////////////7LNH/+WaCv/lmgr/5ZoK/+WaCv/lmgr/8s2F///////qrTj/5ZoK/+WaCv/lmgqA5ZoKMOWaCv/lmgr/5ZoK///////ss0f/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/55sL////////////////////////////////////////////ss0f/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/ss0f//////+yzR//lmgr/5ZoK/+WaCjAAAAAA5ZoKz+WaCv/lmgr//////+egGf/lmgr/5ZoK/+WaCv/lmgr/5ZoK//TTlP///////////////////////////////////////fnw/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+egGf//////6Kcp/+WaCv/lmgrPAAAAAAAAAADlmgpg5ZoK/+WaCv/55sL/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/6Kcp//358P/////////////////////////////////yzYX/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK//rs0f/lmgr/5ZoK/+WaCmAAAAAAAAAAAAAAAADlmgq/5ZoK/+inKf/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/7bpX//358P//////////////////////9NOU/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/7bpX/+WaCv/lmgq/AAAAAAAAAAAAAAAAAAAAAOWaCiDlmgrv5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/56AZ/+26V//yzYX/8MZ1/+inKf/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK7+WaCiAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaClDlmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgpQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCmDlmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoKYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaClDlmgrv5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK7+WaClAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWaCiDlmgq/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCr/lmgogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADlmgpg5ZoKz+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoK/+WaCs/lmgpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5ZoKMOWaCoDlmgq/5ZoK/+WaCv/lmgr/5ZoK/+WaCv/lmgr/5ZoKv+WaCoDlmgowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AA///AAD//AAAP/gAAB/wAAAP4AAAB8AAAAPAAAADgAAAAYAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAcAAAAPAAAAD4AAAB/AAAA/4AAAf/AAAP/8AAP//wAP/'
    })

    Api.Clients.find({}).fetch().map(({ _id }) => {
      Api.Clients.update({ _id }, {
        $set: {
          clientKey: Random._id() + Random._id() + Random._id() + Random._id()
        }
      })
    })

    Api.InboundCallsTopics.find({}, { removed: true }).fetch().forEach(({_id}) => {
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
    Api.Patients.find({}, { fields: { _id: 1 }, removed: true }).fetch().forEach(({ _id }) => {
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
    Api.InboundCalls.find({}, { fields: { _id: 1 }, removed: true }).fetch().forEach(({ _id }) => {
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
    Api.Comments.find({}, { fields: { _id: 1 }, removed: true }).fetch().forEach(({ _id }) => {
      commentsBatch.find({ _id }).updateOne({
        $set: {
          body: 'Anmerkung ABC',
        }
      })
    })
    Meteor.wrapAsync(commentsBatch.execute, commentsBatch)()

    const messagesBatch = Api.Messages.rawCollection().initializeUnorderedBulkOp()
    Api.Messages.find({}, { fields: { _id: 1 }, removed: true }).fetch().forEach(({ _id }) => {
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
    Api.Appointments.find({}, { fields: { _id: 1 }, removed: true }).fetch().forEach(({ _id }) => {
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
