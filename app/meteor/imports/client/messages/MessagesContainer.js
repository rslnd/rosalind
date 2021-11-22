import { withTracker } from '../components/withTracker'
import { withPromise } from '../components/withPromise'
import { compose, toClass } from 'recompose'
import Alert from 'react-s-alert'
import { Messages } from '../../api/messages'
import { InboundCalls } from '../../api/inboundCalls'
import { MessagesScreen } from './MessagesScreen'
import { subscribe } from '../../util/meteor/subscribe'
import { hasRole } from '../../util/meteor/hasRole'

const composer = (props) => {
  const handle = subscribe('messages-inbound')

  if (handle.ready()) {
    const inbound = Messages.find({ type: 'inbound' }).fetch()
    const intentToCancel = Messages.find({ type: 'intentToCancel' }).fetch()

    const onCreateInboundCall = (message) => {
      InboundCalls.methods.post.call({
        lastName: message.channel,
        telephone: message.from,
        note: message.text,
        createdAt: new Date(),
        payload: {
          channel: message.channel,
          messageId: (message.payload && message.payload.messageId) || undefined,
          appointmentId: message.appointmentId || undefined,
          patientId: message.patientId || undefined
        }
      })

      Alert.success('Created inbound call from message')
    }

    return { inbound, intentToCancel, onCreateInboundCall }
  } else {
    return {
      isLoading: true
    }
  }
}

const fetchStats = () => new Promise((resolve) => {
  if (hasRole(Meteor.userId(), ['messages-stats'])) {
    Meteor.call('messages/getStats', {}, (e, stats) => resolve({ stats }) )
  } else {
    resolve({})
  }
})

export const MessagesContainer = compose(
  withPromise(fetchStats),
  withTracker(composer)
)(toClass(MessagesScreen))
