import React from 'react'
import { PatientExtendedFormFields } from './PatientExtendedFormFields'
import { PatientBasicFormFields } from './PatientBasicFormFields'

export const PatientFormFields = ({ extended }) =>
  extended
  ? <PatientExtendedFormFields />
  : <PatientBasicFormFields />
