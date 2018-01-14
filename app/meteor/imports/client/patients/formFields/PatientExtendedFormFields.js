import React from 'react'
import { Field, FieldArray } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { Currency } from '../../components/Currency'
import { ToggleField } from '../../components/form/ToggleField'
import { DayField } from '../../components/form/DayField'
import { CalculatorField } from '../../components/form/CalculatorField'
import { Dot } from '../Dot'
import { twoPlaces } from '../../../util/format'

import { NameFields } from '../fields/NameFields'
import { AddressFields } from '../fields/AddressFields'
import { ContactFields } from '../fields/ContactFields'
import { BirthdayFields } from '../fields/BirthdayFields'

export const PatientExtendedFormFields = () => {
  const title = true
  const note = true
  const externalRevenue = true

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
        <AddressFields />

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

        {
          externalRevenue &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='eur' />
                    </div>
                  </div>
                  <div className='col-md-8'>
                    <div>
                      <Field
                        name='externalRevenue'
                        component={CalculatorField}
                        formatter={twoPlaces}
                        fullWidth
                        hintStyle={{ color: '#ccc' }}
                        hintText='100 50 140 ...'
                        floatingLabelText={TAPi18n.__('patients.revenue')} />
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <Field
                      name='externalRevenue'
                      component={CurrencyField} />
                  </div>
                </div>
              </div>
            </div>
        }

        {
          true &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='calendar-o' />
                    </div>
                  </div>
                  <div className='col-md-10'>
                    <div>
                      <Field
                        name='patientSince'
                        component={DayField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.patientSince')} />
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

const currencyStyle = {
  fontSize: '20px',
  paddingTop: 35,
  textAlign: 'center',
  width: '100%',
  display: 'inline-block'
}

const CurrencyField = ({ input }) =>
  <Currency
    value={input.value}
    style={currencyStyle} />
