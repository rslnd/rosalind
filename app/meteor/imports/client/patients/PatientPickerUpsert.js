import React from 'react'
import { PatientFormFields } from './formFields/PatientFormFields'
import { PatientPickerContainer } from './PatientPickerContainer'
import { reduxForm, Field, formValueSelector } from 'redux-form'

export const PatientPickerUpsert = ({ patientId, extended, autoFocus }) =>
  <div>
    <div className='row'>
      <div className='col-md-12'>
        <Field
          name='patientId'
          component={PatientPickerContainer}
          extended
          autoFocus={autoFocus} />
      </div>
    </div>
    <div className='row'>
      {
        patientId &&
          <div className='row'>
            <div className='col-md-12'>
              <PatientFormFields extended={extended} />
            </div>
          </div>
      }
    </div>
  </div>
