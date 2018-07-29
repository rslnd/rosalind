import { reduxForm, formValueSelector } from 'redux-form'
import { connect } from 'react-redux'
import { withTracker } from '../components/withTracker'
import Alert from 'react-s-alert'
import { Loading } from '../components/Loading'
import { __ } from '../../i18n'
import { Patients } from '../../api/patients'
import { mapFieldsToPatient } from './mapFieldsToPatient'
import { mapStateToProps } from './mapStateToProps'
import { BulkUpsertScreen } from './BulkUpsertScreen'

const composer = (props) => {
  const onSubmit = v => {
    try {
      const patient = mapFieldsToPatient(v.patient)

      return Patients.actions.upsert.callPromise({
        patient,
        replaceContacts: true,
        createExternalReferralTo: '9MY6AiaNrAkcER8DK'
      })
        .then(() => {
          Alert.success(__('patients.editSuccess'))
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

  return { ...props, onSubmit }
}

const formName = 'bulkPatientUpsertForm'
let BulkUpsertContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false
})(BulkUpsertScreen)

BulkUpsertContainer = withTracker(composer)(BulkUpsertContainer)

const selector = formValueSelector(formName)
BulkUpsertContainer = connect(mapStateToProps(selector))(BulkUpsertContainer)

export { BulkUpsertContainer }
