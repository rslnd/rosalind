import React from 'react'
import { Field, FieldArray } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from '../components/Icon'
import { Currency } from '../components/Currency'
import { ToggleField } from '../components/form/ToggleField'
import { DayField } from '../components/form/DayField'
import { CalculatorField } from '../components/form/CalculatorField'
import { Dot } from './Dot'
import { twoPlaces } from '../../util/format';

const filterField = channel => field => field && field.channel === channel

const ContactsField = ({ fields, icon, channel }) => {
  const count = (fields.getAll() || [])
    .filter(filterField(channel))
    .length

  return <div>
    {
      fields.map((member, i) => (
        // can't call .filter on `fields` as it's not a real array
        filterField(channel)(fields.get(i)) &&
          <div key={i} className='row'>
            <div className='col-md-12'>
              <div className='row no-pad' style={{ marginTop: -15, zIndex: 14 }}>
                <div className='col-md-1'>
                  <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                    <Icon name={icon} />
                  </div>
                </div>
                <div className='col-md-10'>
                  <div className='row'>
                    <div className='col-md-10'>
                      <Field
                        name={`${member}.value`}
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__(`patients.${channel.toLowerCase()}`)} />
                    </div>
                    <div className='col-md-2' style={{ paddingTop: 32 }}>
                      {
                        count > 1 &&
                          <FlatButton
                            onClick={() => fields.remove(i)}
                            style={{ minWidth: 35, color: '#ccc' }}>
                            <Icon name='remove' />
                          </FlatButton>
                      }
                      {
                        count < 5 &&
                          <FlatButton
                            onClick={() => fields.insert(i + 1, { channel })}
                            style={{ minWidth: 35 }}>
                            <Icon name='plus' />
                          </FlatButton>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      }
  </div>
}

export const PatientExtendedFormFields = () => {
  const name = true
  const title = true
  const birthday = true
  const address = true
  const phone = true
  const email = true
  const note = true
  const externalRevenue = true

  return <div>
    <div className='row'>
      <div className='col-md-12'>
        {
          name &&
            <div className='row no-pad' style={{ marginTop: -10, zIndex: 19 }}>
              <div className='col-md-1'>
                <div style={{ textAlign: 'center' }}>
                  <Field
                    name='gender'
                    component={ToggleField}
                    style={{ minWidth: 31, marginTop: 32 }}
                    values={[
                      { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
                      { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
                    ]} />
                </div>
              </div>
              <div className='col-md-5'>
                <div>
                  <Field
                    name='lastName'
                    component={TextField}
                    fullWidth
                    floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
                </div>
              </div>
              <div className='col-md-5'>
                <div>
                  <Field
                    name='firstName'
                    component={TextField}
                    fullWidth
                    autoFocus
                    floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
                </div>
              </div>
            </div>
        }

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

        {
          birthday &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ minWidth: 31, marginTop: -15, textAlign: 'center', zIndex: 17 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='id-card-o' />
                    </div>
                  </div>
                  <div className='col-md-3'>
                    <div>
                      <Field
                        name='insuranceId'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.insuranceId')} />
                    </div>
                  </div>
                  <div className='col-md-7'>
                    <div>
                      <Field
                        name='birthday'
                        component={DayField}
                        birthday
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.birthday')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }

        {
          address &&
            <div>
              <div className='row'>
                <div className='col-md-12'>
                  <div className='row no-pad' style={{ marginTop: -15, zIndex: 16 }}>
                    <div className='col-md-1'>
                      <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                        <Icon name='home' />
                      </div>
                    </div>
                    <div className='col-md-10'>
                      <div>
                        <Field
                          name='addressLine1'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressLine1')} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-12'>
                  <div className='row no-pad' style={{ marginTop: -15, zIndex: 15 }}>
                    <div className='col-md-1'>
                      <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                        <Icon name='map-marker' />
                      </div>
                    </div>
                    <div className='col-md-3'>
                      <div>
                        <Field
                          name='addressPostalCode'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressPostalCode')} />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div>
                        <Field
                          name='addressLocality'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressLocality')} />
                      </div>
                    </div>
                    <div className='col-md-3'>
                      <div>
                        <Field
                          name='addressCountry'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressCountry')} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }

        {
          true && <div>
            <FieldArray
              name='contacts'
              channel='Phone'
              icon='phone'
              component={ContactsField} />

            <FieldArray
              name='contacts'
              channel='Email'
              icon='envelope-open-o'
              component={ContactsField} />
          </div>
        }

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
