import React from 'react'
import { Field } from 'redux-form'
import { __ } from '../../../i18n'
import { TextField, ToggleField } from '../../components/form'
import { grayActive } from '../../layout/styles'
import { rowStyle, buttonStyle, grow, shrink } from '../../components/form/rowStyle'
import { Dot } from '../../patients/Dot'

const titleStyle = {
  ...grow,
  width: 42
}

export const GenderField = ({ onChange }) =>
  <div style={buttonStyle}>
    <Field
      name='gender'
      component={ToggleField}
      style={{ minWidth: 31, padding: 10 }}
      onChange={onChange}
      values={[
        { value: 'Female', label: __('patients.salutationFemale') },
        { value: 'Male', label: __('patients.salutationMale') }
      ]} />
  </div>

const TitleLabel = () =>
  <span style={{ color: grayActive }}>{__('patients.titlePrepend')}</span>

export const NameFields = ({ gender = true, titles = false, ban = false, nameEditable = true }) =>
  <div style={rowStyle}>
    {
      gender &&
        <GenderField />
    }

    {
      titles &&
        <div style={titleStyle}>
          <Field
            name='titlePrepend'
            label={<TitleLabel />}
            fullWidth
            component={TextField} />
        </div>
    }

    <div style={grow}>
      <Field
        name='lastName'
        component={TextField}
        fullWidth
        disabled={!nameEditable}
        label={__('patients.lastName')} />
    </div>
    <div style={grow}>
      <Field
        name='firstName'
        component={TextField}
        fullWidth
        disabled={!nameEditable}
        label={__('patients.firstName')} />
    </div>

    {
      ban &&
        <div style={shrink}>
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
    }
  </div>
