import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from '../../components/Icon'
import { ToggleField } from '../../components/form/ToggleField'
import { BirthdayField } from '../../components/form/BirthdayField'
import { Dot } from '../Dot'

export const NewPatientExtendedFormFields = () => {
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
                        component={BirthdayField}
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
                    <div className='col-md-5'>
                      <div>
                        <Field
                          name='addressLine1'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressLine1')} />
                      </div>
                    </div>
                    <div className='col-md-5'>
                      <div>
                        <Field
                          name='addressLine2'
                          component={TextField}
                          fullWidth
                          floatingLabelText={TAPi18n.__('patients.addressLine2')} />
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
          phone &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -15, zIndex: 14 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='phone' />
                    </div>
                  </div>
                  <div className='col-md-10'>
                    <div>
                      <Field
                        name='telephone'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('inboundCalls.form.telephone.label')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }

        {
          email &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='row no-pad' style={{ marginTop: -15, zIndex: 13 }}>
                  <div className='col-md-1'>
                    <div style={{ minWidth: 31, marginTop: 40, textAlign: 'center' }}>
                      <Icon name='envelope-open-o' />
                    </div>
                  </div>
                  <div className='col-md-10'>
                    <div>
                      <Field
                        name='email'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.email')} />
                    </div>
                  </div>
                </div>
              </div>
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
                  <div className='col-md-10'>
                    <div>
                      <Field
                        name='externalRevenue'
                        component={TextField}
                        fullWidth
                        floatingLabelText={TAPi18n.__('patients.revenue')} />
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
