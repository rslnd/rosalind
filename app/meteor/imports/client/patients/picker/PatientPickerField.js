import React from 'react'
import { Field } from 'redux-form'
import { PatientPicker } from './PatientPickerContainer'
import { connect } from 'react-redux'

const PatientPickerFieldComponent = ({ extended, upsert, isUpserting, input, meta }) =>
  <div>
    <Field
      name='patientId'
      component={PatientPicker}
    />

    {
      upsert && isUpserting &&
        'Upsert Form...'
    }
  </div>

const mapStateToProps = (state) => ({
  isUpserting: state.patientPicker && state.patientPicker.isUpserting
})

export const PatientPickerField = connect(mapStateToProps)(PatientPickerFieldComponent)
