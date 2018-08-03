import { reduxForm } from 'redux-form'
import { validate } from './newAppointmentValidators'
import { NewAppointmentFields } from './NewAppointmentFields'
import { translateObject } from '../../components/form/translateObject'

const formName = 'newAppointment'

let NewAppointmentForm = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false,
  validate: v => translateObject(validate(v))
})(NewAppointmentFields)

export { NewAppointmentForm }
