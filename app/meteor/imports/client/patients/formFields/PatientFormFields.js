import React from 'react'
import { PatientExtendedFormFields } from './PatientExtendedFormFields'
import { PatientBasicFormFields } from './PatientBasicFormFields'

export const PatientFormFields = (props) =>
  props.extended
  ? <PatientExtendedFormFields {...props} />
  : <PatientBasicFormFields {...props} />
