import React from 'react'
import { Field, FormName } from 'redux-form'
import { PatientPicker } from './PatientPickerContainer'
import { PatientFormFields } from '../formFields/PatientFormFields'
import { connect } from 'react-redux'

export const PatientPickerField = connect(state => ({
  showFields: state.patientPicker.patient
}))(({ change, extended, upsert, showFields }) =>
  <div>
    <FormName>{
      ({ form }) =>
        <Field
          name='patientId'
          component={PatientPicker}
          formName={form}
          upsert={upsert}
        />
    }</FormName>

    {
      upsert && showFields &&
        <PatientFormFields
          change={change}
          extended={extended}
        />
    }
  </div>
)
