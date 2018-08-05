import React from 'react'
import { Field } from 'redux-form'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { rowStyle, iconStyle, grow } from '../../components/form/rowStyle'
import { TextField } from '../../components/form'
import ort from 'plz-ort'

const autofillLocality = change => (e, postalCode) => {
  if (postalCode && postalCode.length === 4) {
    const locality = ort(postalCode)
    if (locality && change) {
      change('patient.address.locality', locality.toString())
    }
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
          label={__('patients.addressLine1')} />
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
          onChange={autofillLocality(change)}
          label={__('patients.addressPostalCode')} />
      </div>
      <div style={grow}>
        <Field
          name='locality'
          component={TextField}
          label={__('patients.addressLocality')} />
      </div>
      <div style={countryStyle}>
        <Field
          name='country'
          component={TextField}
          label={__('patients.addressCountry')} />
      </div>
    </div>
  </div>
