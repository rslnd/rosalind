import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { toClass } from 'recompose'
import Alert from 'react-s-alert'
import { Messages } from '../../api/messages'
import { InboundCalls } from '../../api/inboundCalls'
import { Loading } from '../components/Loading'
import { MessagesScreen } from './MessagesScreen'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props, onData) => {
  const handle = subscribe('messages-inbound')

  if (handle.ready()) {
    const inbound = Messages.find({ type: 'inbound' })
    const intentToCancel = Messages.find({ type: 'intentToCancel' })

    const onCreateInboundCall = (message) => {
      InboundCalls.methods.post.call({
        lastName: message.channel,
        telephone: message.from,
        note: message.text,
        payload: {
          channel: message.channel,
          messageId: message.payload && message.payload.messageId || undefined,
          appointmentId: message.payload && message.payload.appointmentId || undefined,
          patientId: message.payload && message.payload.appointmentId || undefined
        }
      })

      Alert.success('Created inbound call from message')
    }

    onData(null, { inbound, intentToCancel, onCreateInboundCall })
  }
}

export const MessagesContainer = composeWithTracker(composer, Loading)(toClass(MessagesScreen))
