import { reduxForm, formValueSelector } from 'redux-form'
import { connect } from 'react-redux'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import Alert from 'react-s-alert'
import { Loading } from '../components/Loading'
import { TAPi18n } from 'meteor/tap:i18n'
import { Patients } from '../../api/patients'
import { mapFieldsToPatient } from './mapFieldsToPatient'
import { mapStateToProps } from './mapStateToProps'
import { BulkUpsertScreen } from './BulkUpsertScreen'

const composer = (props, onData) => {
  const onSubmit = v => {
    try {
      const patient = mapFieldsToPatient(v.patient)

      return Patients.actions.upsert.callPromise({
        patient,
        replaceContacts: true,
        createExternalReferralTo: '9MY6AiaNrAkcER8DK'
      })
        .then(() => {
          Alert.success(TAPi18n.__('patients.editSuccess'))
          props.dispatch({ type: 'LOAD_PATIENT', data: patient })
        })
        .catch(e => {
          Alert.error('Bitte noch einmal versuchen')
          console.error(e)
        })
    } catch (e) {
      Alert.error('Bitte noch einmal versuchen')
      console.error(e)
    }
  }

  onData(null, { ...props, onSubmit })
}

const formName = 'bulkPatientUpsertForm'
let BulkUpsertContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false
})(BulkUpsertScreen)

BulkUpsertContainer = composeWithTracker(composer, Loading)(BulkUpsertContainer)

const selector = formValueSelector(formName)
BulkUpsertContainer = connect(mapStateToProps(selector))(BulkUpsertContainer)

export { BulkUpsertContainer }
