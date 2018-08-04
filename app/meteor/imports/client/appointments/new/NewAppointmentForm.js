import { compose } from 'recompose'
import { reduxForm } from 'redux-form'
import { validate } from './newAppointmentValidators'
import { NewAppointmentFields } from './NewAppointmentFields'
import { translateObject } from '../../components/form/translateObject'
import { withPatientInitialValues } from '../../patients/picker/withPatientPicker'

const formName = 'newAppointment'

export const NewAppointmentForm = compose(
  withPatientInitialValues,
  reduxForm({
    form: formName,
    enableReinitialize: true,
    updateUnregisteredFields: true,
    keepDirtyOnReinitialize: false,
    pure: false,
    validate: v => translateObject(validate(v))
  })
)(NewAppointmentFields)
