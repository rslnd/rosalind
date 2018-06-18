import React from 'react'
import { Field } from 'redux-form'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { DayField } from '../../components/form/DayField'
import { rowStyle, iconStyle, grow } from '../../components/form/rowStyle'
import { TextField } from '../../components/form'

const insuranceIdStyle = {
  minWidth: 130,
  width: '20%'
}

export const BirthdayFields = ({ collectInsuranceId }) =>
  <div style={rowStyle}>
    <div style={iconStyle}>
      <Icon name={collectInsuranceId ? 'id-card-o' : 'birthday-cake'} />
    </div>
    {
      collectInsuranceId &&
        <div style={insuranceIdStyle}>
          <Field
            name='insuranceId'
            component={TextField}
            label={TAPi18n.__('patients.insuranceId')} />
        </div>
    }
    <div style={grow}>
      <Field
        name='birthday'
        component={DayField}
        birthday
        label={TAPi18n.__('patients.birthday')} />
    </div>
  </div>
