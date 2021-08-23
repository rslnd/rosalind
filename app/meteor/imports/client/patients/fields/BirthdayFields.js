import React from 'react'
import { Field } from 'redux-form'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { DayField } from '../../components/form/DayField'
import { rowStyle, iconStyle, grow } from '../../components/form/rowStyle'
import { TextField } from '../../components/form'

const insuranceIdStyle = {
  minWidth: 130,
  width: '20%'
}

export const BirthdayFields = ({ collectInsuranceId, nameEditable = true }) =>
  <div style={rowStyle}>
    <div style={iconStyle}>
      <Icon name={collectInsuranceId ? 'id-card-o' : 'birthday-cake'} />
    </div>
    {
      collectInsuranceId &&
        <div style={insuranceIdStyle}>
          <Field
            name='insuranceId'
            disabled={!nameEditable}
            component={TextField}
            label={__('patients.insuranceId')} />
        </div>
    }
    <div style={grow}>
      <Field
        name='birthday'
        component={DayField}
        disabled={!nameEditable}
        birthday
        label={__('patients.birthday')} />
    </div>
  </div>
