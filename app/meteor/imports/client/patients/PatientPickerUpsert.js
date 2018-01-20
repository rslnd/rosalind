import React from 'react'
import { PatientFormFields } from './formFields/PatientFormFields'
import { PatientPickerContainer } from './PatientPickerContainer'
import { reduxForm, Field, formValueSelector } from 'redux-form'

const fullWidthStyle = {
  width: '100%'
}

export const PatientPickerUpsert = (props) =>
  <div style={fullWidthStyle}>
    <Field
      name='patientId'
      component={PatientPickerContainer}
      extended
      autoFocus={props.autoFocus} />
    {
      props.patientId &&
        <PatientFormFields {...props} />
    }
  </div>
