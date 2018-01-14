import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'

export const AddressFields = () =>
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
