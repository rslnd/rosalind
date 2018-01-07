import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import Alert from 'react-s-alert'
import { PatientPickerContainer } from './patientPicker/PatientPickerContainer'
import RaisedButton from 'material-ui/RaisedButton'
import { Icon } from '../components/Icon'
import { Loading } from '../components/Loading'
import { Box } from '../components/Box'
import { TAPi18n } from 'meteor/tap:i18n'

import { Meteor } from 'meteor/meteor'
import { Patients } from '../../api/patients'

const NewPatientForm = ({ submitting, handleSubmit, onSubmit }) => (
  <div className='content'>
    <Box title='Stammdaten vervollständigen'>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <div className='row'>
          <div className='col-md-12'>
            <Field
              name='patientId'
              component={PatientPickerContainer}
              extended
              autofocus />
          </div>
        </div>

        <div className='row' style={{ marginTop: 10 }}>
          <div className='col-md-12'>
            <RaisedButton type='submit'
              onClick={handleSubmit(onSubmit)}
              fullWidth
              primary
              label={submitting
                ? <Icon name='refresh' spin />
                : TAPi18n.__('patients.thisSave')} />
          </div>
        </div>
      </form>
    </Box>
  </div>
)

export const NewPatientFormContainer = reduxForm({
  form: 'bulkNewPatientForm',
  fields: [
    'patientId',
    'gender',
    'firstName',
    'lastName',
    'titlePrepend',
    'titleAppend',
    'insuranceId',
    'birthday',
    'addressLine1',
    'addressLine2',
    'addressPostalCode',
    'addressLocality',
    'addressCountry',
    'telephone',
    'email',
    'patientNote',
    'externalRevenue',
    'banned'
  ]
})(NewPatientForm)

const composer = (props, onData) => {
  const onSubmit = v => {
    try {
      let patientId = v.patientId
      let patient = null

      if (patientId) {
        if (patientId === 'newPatient') {
          patientId = undefined
        }

        patient = {
          _id: patientId,
          insuranceId: v.insuranceId,
          note: v.patientNote,
          externalRevenue: v.externalRevenue,
          profile: {
            gender: v.gender,
            lastName: v.lastName,
            firstName: v.firstName,
            titlePrepend: v.titlePrepend,
            titleAppend: v.titleAppend,
            birthday: v.birthday,
            banned: v.banned,
            note: v.patientNote,
            address: {
              line1: v.addressLine1,
              line2: v.addressLine2,
              postalCode: v.addressPostalCode,
              locality: v.addressLocality,
              country: v.addressCountry
            }
          }
        }

        patient.profile.contacts = []

        if (v.telephone) {
          patient.profile.contacts.push({
            channel: 'Phone', value: v.telephone
          })
        }

        if (v.email) {
          patient.profile.contacts.push({
            channel: 'Email', value: v.email
          })
        }
      }

      console.log({ v, patient })

      return Patients.actions.upsert.callPromise({ patient })
        .then(() => Alert.success(''))
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

const BulkNewPatientContainer = composeWithTracker(composer, Loading)(NewPatientFormContainer)

export { BulkNewPatientContainer }
