import React from 'react'
import find from 'lodash/fp/find'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
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
              alwaysUpsert
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

const composer = (props, onData) => {
  const onSubmit = v => {
    try {
      let patientId = v.patientId
      let patient = null

      if (patientId) {
        if (patientId === 'newPatient') {
          patientId = undefined
        }

        const contacts = (v.contacts || []).filter(c => c.value)

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
            contacts,
            address: {
              line1: v.addressLine1,
              line2: v.addressLine2,
              postalCode: v.addressPostalCode,
              locality: v.addressLocality,
              country: v.addressCountry
            }
          }
        }
      }

      console.log({ v, patient })

      return Patients.actions.upsert.callPromise({ patient, replaceContacts: true })
        .then(() => Alert.success(TAPi18n.__('patients.editSuccess')))
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

let BulkNewPatientContainer = reduxForm({
  form: 'bulkNewPatientForm',
  enableReinitialize: true,
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
    'contacts',
    'telephone',
    'email',
    'patientNote',
    'externalRevenue',
    'banned'
  ]
})(NewPatientForm)

BulkNewPatientContainer = composeWithTracker(composer, Loading)(BulkNewPatientContainer)

BulkNewPatientContainer = connect(
  state => {
    const patient = state.loadPatient.data
    if (patient && patient.profile) {
      let address = {}
      if (patient.profile.address) {
        address = {
          addressLine1: patient.profile.address.line1,
          addressLine2: patient.profile.address.line2,
          addressPostalCode: patient.profile.address.postalCode,
          addressLocality: patient.profile.address.locality,
          addressCountry: patient.profile.address.country
        }
      }

      let contacts = patient.profile.contacts || [];
      ['Phone', 'Email'].map(channel => {
        if (!find(c => c.channel === channel)(contacts)) {
          contacts.push({ channel })
        }
      })

      return ({
        initialValues: {
          patientId: patient._id,
          insuranceId: patient.insuranceId,
          gender: patient.profile.gender,
          firstName: patient.profile.firstName,
          lastName: patient.profile.lastName,
          titlePrepend: patient.profile.titlePrepend,
          titleAppend: patient.profile.titleAppend,
          birthday: patient.profile.birthday,
          contacts,
          ...address,
          banned: patient.profile.banned,
          externalRevenue: patient.externalRevenue,
          note: patient.note
        }
      })
    } else {
      return {
        initialValues: {
          contacts: [
            { channel: 'Phone' },
            { channel: 'Email' }
          ]
        }
      }
    }
  }
)(BulkNewPatientContainer)

export { BulkNewPatientContainer }
