import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
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
    <Box icon='user-plus' title='Stammdaten vervollständigen'>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <div className='row'>
          <div className='col-md-12'>
            <Field
              name='patientId'
              component={PatientPickerContainer}
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
  fields: ['patientId', 'firstName', 'lastName', 'gender', 'telephone', 'email', 'birthday', 'patientNote']
})(NewPatientForm)

const composer = (props, onData) => {
  const onSubmit = (v) => {
    console.log('a >', v)
  }

  onData(null, { ...props, onSubmit })
}

const BulkNewPatientContainer = composeWithTracker(composer, Loading)(NewPatientFormContainer)

export { BulkNewPatientContainer }
