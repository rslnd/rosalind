import { publish } from '../../../util/meteor/publish'
import { Clients } from '../'
import { Patients } from '../../patients'

export const publication = () => {
  publish({
    name: 'clients',
    roles: ['admin'],
    fn: function () {
      return Clients.find({})
    }
  })

  publish({
    name: 'client',
    args: {
      clientKey: String
    },
    allowAnonymous: true,
    requireClientKey: true,
    fn: function ({ clientKey }) {
      return Clients.find({
        clientKey
      }, {
        limit: 1,
        fields: {
          clientKey: 1,
          description: 1,
          settings: 1,
          pairingAllowed: 1,
          pairingToken: 1,
          currentPatientId: 1,
          currentAppointmentId: 1,
          currentCycle: 1
        }
      })
    }
  })

  publish({
    name: 'client-producers',
    args: {
      clientKey: String
    },
    allowAnonymous: true,
    requireClientKey: true,
    fn: function ({ clientKey }) {
      const consumer = Clients.findOne({ clientKey })
      const producers = Clients.find({ pairedTo: consumer._id }, { fields: {
        _id: 1,
        description: 1,
        pairedTo: 1,
      } })

      return producers
    }
  })

  publish({
    name: 'client-consumer',
    args: {
      clientKey: String
    },
    allowAnonymous: true,
    requireClientKey: true,
    fn: function ({ clientKey }) {
      const producer = Clients.findOne({ clientKey })
      if (!producer) { throw new Error('Producer not found') }

      const consumer = Clients.find({ _id: producer.pairedTo }, { fields: {
        _id: 1,
        description: 1,
        currentPatientId: 1,
        currentAppointmentId: 1,
        currentCycle: 1
      } })

      if (!consumer.fetch().length === 1) {
        throw new Error('Consumer not found')
      }

      return consumer
    }
  })
}
