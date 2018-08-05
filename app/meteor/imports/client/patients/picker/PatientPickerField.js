import React from 'react'
import { Field, FormName } from 'redux-form'
import { PatientPicker } from './PatientPickerContainer'
import { PatientFormFields } from '../formFields/PatientFormFields'
import { connect } from 'react-redux'

const PatientPickerFieldComponent = ({ change, extended, upsert, isUpserting, input, meta }) =>
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
      upsert && isUpserting &&
        <PatientFormFields
          change={change}
          extended={extended}
        />
    }
  </div>

const mapStateToProps = (state) => ({
  isUpserting: state.patientPicker && state.patientPicker.isUpserting
})

export const PatientPickerField = connect(mapStateToProps)(PatientPickerFieldComponent)
