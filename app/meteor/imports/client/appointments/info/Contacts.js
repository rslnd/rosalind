import React from 'react'
import { FieldArray } from 'redux-form'
import { ContactFields } from '../../patients/fields/ContactFields'

export const Contacts = ({ patient }) => (
  patient &&
    <div>
      <FieldArray
        name='contacts'
        channel='Phone'
        icon='phone'
        zoomable
        component={ContactFields} />

      <FieldArray
        name='contacts'
        channel='Email'
        icon='envelope-open-o'
        component={ContactFields} />
    </div> || null
)
