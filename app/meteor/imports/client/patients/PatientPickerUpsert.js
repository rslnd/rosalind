import React from 'react'
import { PatientFormFields } from './PatientFormFields'
import { PatientPickerContainer } from './PatientPickerContainer'
import { reduxForm, Field, formValueSelector } from 'redux-form'

export const PatientPickerUpsert = ({ patientId }) =>
  <div>
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
    <div className='row'>
      {
        patientId &&
          <div className='row'>
            <div className='col-md-12'>
              <PatientFormFields extended />
            </div>
          </div>
      }
    </div>
  </div>
