import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import Alert from 'react-s-alert'
import { Messages } from '../../api/messages'
import { InboundCalls } from '../../api/inboundCalls'
import { MessagesScreen } from './MessagesScreen'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const handle = subscribe('messages-inbound')

  if (handle.ready()) {
    const inbound = Messages.find({ type: 'inbound' })
    const intentToCancel = Messages.find({ type: 'intentToCancel' })

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

export const MessagesContainer = withTracker(composer)(toClass(MessagesScreen))
