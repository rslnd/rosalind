import Alert from 'react-s-alert'
import { Appointments } from '../../api/appointments'
import { __ } from '../../i18n'

export const updateAppointment = (props, update) =>
  Appointments.actions.update.callPromise({
    appointmentId: props._id,
    update
  }).then(() =>
    Alert.success(__('ui.saved'))
  )
