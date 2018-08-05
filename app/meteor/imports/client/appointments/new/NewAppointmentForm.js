import { compose } from 'recompose'
import { reduxForm } from 'redux-form'
import { validate } from './newAppointmentValidators'
import { NewAppointmentFields } from './NewAppointmentFields'
import { translateObject } from '../../components/form/translateObject'
import { withPatientInitialValues } from '../../patients/picker/withPatientPicker'

export const formName = 'newAppointment'

export const NewAppointmentForm = compose(
  withPatientInitialValues(formName),
  reduxForm({
    form: formName,
    enableReinitialize: false,
    updateUnregisteredFields: true,
    keepDirtyOnReinitialize: true,
    touchOnChange: true,
    destroyOnUnmount: false,
    pure: false,
    validate: v => translateObject(validate(v))
  })
)(NewAppointmentFields)
