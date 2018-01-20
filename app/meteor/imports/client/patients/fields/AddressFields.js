import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { rowStyle, iconStyle, grow } from '../../components/form/rowStyle'

export const AddressFields = () =>
  <div>
    <div style={rowStyle}>
      <div style={iconStyle}>
        <Icon name='home' />
      </div>
      <div style={grow}>
        <Field
          name='line1'
          component={TextField}
          fullWidth
          floatingLabelText={TAPi18n.__('patients.addressLine1')} />
      </div>
    </div>
    <div style={rowStyle}>
      <div style={iconStyle}>
        <Icon name='map-marker' />
      </div>

      <div style={{ flexGrow: 1 }}>
        <Field
          name='postalCode'
          component={TextField}
          fullWidth
          floatingLabelText={TAPi18n.__('patients.addressPostalCode')} />
      </div>
      <div style={{ flexGrow: 3 }}>
        <Field
          name='locality'
          component={TextField}
          fullWidth
          floatingLabelText={TAPi18n.__('patients.addressLocality')} />
      </div>
      <div style={{ flexGrow: 1 }}>
        <Field
          name='country'
          component={TextField}
          fullWidth
          floatingLabelText={TAPi18n.__('patients.addressCountry')} />
      </div>
    </div>
  </div>
