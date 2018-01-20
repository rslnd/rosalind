import React from 'react'
import { Field } from 'redux-form'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { rowStyle, iconStyle, grow } from '../../components/form/rowStyle'
import { TextField } from '../../components/form'
import ort from 'plz-ort'

const autofillLocality = change => (e, postalCode) => {
  const locality = ort(postalCode)
  if (locality) {
    change('address.locality', locality.toString())
  }
}

const postalCodeStyle = {
  minWidth: 70,
  width: '20%'
}

const countryStyle = {
  minWidth: 70,
  width: '20%'
}

export const AddressFields = ({ change }) =>
  <div>
    <div style={rowStyle}>
      <div style={iconStyle}>
        <Icon name='home' />
      </div>
      <div style={grow}>
        <Field
          name='line1'
          component={TextField}
          label={TAPi18n.__('patients.addressLine1')} />
      </div>
    </div>
    <div style={rowStyle}>
      <div style={iconStyle}>
        <Icon name='map-marker' />
      </div>

      <div style={postalCodeStyle}>
        <Field
          name='postalCode'
          component={TextField}
          onBlur={autofillLocality(change)}
          label={TAPi18n.__('patients.addressPostalCode')} />
      </div>
      <div style={grow}>
        <Field
          name='locality'
          component={TextField}
          label={TAPi18n.__('patients.addressLocality')} />
      </div>
      <div style={countryStyle}>
        <Field
          name='country'
          component={TextField}
          label={TAPi18n.__('patients.addressCountry')} />
      </div>
    </div>
  </div>
