import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Messages } from 'api/messages'
import { Loading } from 'client/ui/components/Loading'
import { MessagesScreen } from './MessagesScreen'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('messages-inbound')

  if (handle.ready()) {
    const inbound = Messages.find({ type: 'inbound' })
    const intentToCancel = Messages.find({ type: 'intentToCancel' })

    onData(null, { inbound, intentToCancel })
  }
}

export const MessagesContainer = composeWithTracker(composer, Loading)(MessagesScreen)
