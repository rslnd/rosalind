import { compose } from 'recompose'
import { reduxForm } from 'redux-form'
import { validate } from './newAppointmentValidators'
import { NewAppointmentFields } from './NewAppointmentFields'
import { translateObject } from '../../components/form/translateObject'
import { withPatientInitialValues } from '../../patients/picker/withPatientPicker'
import { withTracker } from '../../components/withTracker'

export const formName = 'newAppointment'

const composer = props => {
  const { calendar } = props
  const requiredFields = (calendar && calendar.requiredFields) || []
  console.log('v','cc', calendar)
  return {
    validate: v => translateObject(validate(v, requiredFields))
  }
}

export const NewAppointmentForm = compose(
  withPatientInitialValues(formName),
  withTracker(composer),
  reduxForm({
    form: formName,
    enableReinitialize: false,
    updateUnregisteredFields: true,
    keepDirtyOnReinitialize: true,
    touchOnChange: true,
    destroyOnUnmount: false,
    pure: false
  })
)(NewAppointmentFields)
