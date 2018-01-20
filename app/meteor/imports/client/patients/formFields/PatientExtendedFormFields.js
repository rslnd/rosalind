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

export const PatientExtendedFormFields = ({ change }) => {
  const title = true
  const note = true

  return <div>
    <div className='row'>
      <div className='col-md-12'>
        <NameFields />

        {
          title &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -10, zIndex: 18 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='university' />
                    </div>
                  </div>
                  <div className='col-md-5'>
                    <div>
                      <Field
                        name='titlePrepend'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.titlePrepend')} />
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <div>
                      <Field
                        name='titleAppend'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.titleAppend')} />
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <div>
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
                </div>
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
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='info-circle' />
                    </div>
                  </div>
                  <div className='col-md-10'>
                    <div>
                      <Field
                        name='patientNote'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.note')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }
      </div>
    </div>
  </div>
}
