import React from 'react'
import { Field, FieldArray, FormSection } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { ToggleField } from '../../components/form/ToggleField'
import { Dot } from '../Dot'

import { NameFields } from '../fields/NameFields'
import { AddressFields } from '../fields/AddressFields'
import { ContactFields } from '../fields/ContactFields'
import { BirthdayFields } from '../fields/BirthdayFields'
import { iconStyle, rowStyle, grow, shrink } from '../../components/form/rowStyle';

export const PatientExtendedFormFields = ({ change }) => {
  const title = true
  const note = true

  return <div>
    <div className='row'>
      <div className='col-md-12'>
        <NameFields />

        {
          title &&
            <div style={rowStyle}>
              <div style={iconStyle}>
                <Icon name='university' />
              </div>
              <div style={grow}>
                <Field
                  name='titlePrepend'
                  component={TextField}
                  fullWidth
                  floatingLabelText={TAPi18n.__('patients.titlePrepend')} />
              </div>
              <div style={grow}>
                <Field
                  name='titleAppend'
                  component={TextField}
                  fullWidth
                  floatingLabelText={TAPi18n.__('patients.titleAppend')} />
              </div>
              <div style={shrink}>
                <Field
                  name='banned'
                  component={ToggleField}
                  button={false}
                  style={{ marginTop: 32, marginLeft: 32 }}
                  values={[
                    { value: false, label: <Dot /> },
                    { value: true, label: <Dot banned /> }
                  ]} />
              </div>
            </div>
        }

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
                  name='patientNote'
                  component={TextField}
                  fullWidth
                  floatingLabelText={TAPi18n.__('patients.note')} />
              </div>
            </div>
        }
      </div>
    </div>
  </div>
}
