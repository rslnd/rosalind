import React from 'react'
import { FieldArray } from 'redux-form'
import { NameFields } from '../fields/NameFields'
import { BirthdayFields } from '../fields/BirthdayFields'
import { ContactFields } from '../fields/ContactFields'

export const PatientBasicFormFields = (props) =>
  <div>
    <NameFields {...props} />

    <BirthdayFields {...props} />

    <FieldArray
      name='contacts'
      channel='Phone'
      icon='phone'
      component={ContactFields}
      {...props}
    />

    <FieldArray
      name='contacts'
      channel='Email'
      icon='envelope-open-o'
      component={ContactFields}
      {...props}
    />
  </div>
