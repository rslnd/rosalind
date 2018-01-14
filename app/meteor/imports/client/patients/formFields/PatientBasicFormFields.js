import React from 'react'
import { FieldArray } from 'redux-form'
import { NameFields } from '../fields/NameFields'
import { BirthdayFields } from '../fields/BirthdayFields'
import { ContactFields } from '../fields/ContactFields'

export const PatientBasicFormFields = () =>
  <div>
    <div className='row'>
      <div className='col-md-12'>
        <NameFields />

        <BirthdayFields />

        <FieldArray
          name='contacts'
          channel='Phone'
          icon='phone'
          component={ContactFields} />

        <FieldArray
          name='contacts'
          channel='Email'
          icon='envelope-open-o'
          component={ContactFields} />

      </div>
    </div>
  </div>
