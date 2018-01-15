import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { PatientPickerContainer } from './PatientPickerContainer'

const containerStyle = {
  width: '100%'
}

const PickerForm = () =>
  <div style={containerStyle}>
    <form>
      <Field
        name='patientId'
        component={PatientPickerContainer}
        />
    </form>
  </div>

export const StandalonePatientPickerContainer = reduxForm({
  form: 'standalonePatientPicker',
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false,
  fields: [ 'patientId' ]
})(PickerForm)
