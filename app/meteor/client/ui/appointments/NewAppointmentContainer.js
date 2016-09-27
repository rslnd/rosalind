import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Loading } from 'client/ui/components/Loading'
import { NewAppointment } from './NewAppointment'

const composer = (props, onData) => {
  onData(null, { ...props })
}

const NewAppointmentContainer = composeWithTracker(composer, Loading)(NewAppointment)

export { NewAppointmentContainer }
