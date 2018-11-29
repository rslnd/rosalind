import React from 'react'
import { Field, FieldArray, FormSection } from 'redux-form'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { TextField } from '../../components/form'

import { NameFields } from '../fields/NameFields'
import { AddressFields } from '../fields/AddressFields'
import { ContactFields } from '../fields/ContactFields'
import { BirthdayFields } from '../fields/BirthdayFields'
import { iconStyle, rowStyle, grow, shrink } from '../../components/form/rowStyle'

export const PatientExtendedFormFields = ({ change }) => {
  const titles = true
  const note = true
  const ban = true

  return <div>
    <div className='row'>
      <div className='col-md-12'>
        <NameFields titles={titles} ban={ban} />

        <BirthdayFields collectInsuranceId />

        <FormSection name='address'>
          <AddressFields change={change} />
        </FormSection>

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

        {
          note &&
            <div style={rowStyle}>
              <div style={iconStyle}>
                <Icon name='info-circle' />
              </div>
              <div style={grow}>
                <Field
                  name='note'
                  component={TextField}
                  fullWidth
                  label={__('patients.note')} />
              </div>
            </div>
        }
      </div>
    </div>
  </div>
}
