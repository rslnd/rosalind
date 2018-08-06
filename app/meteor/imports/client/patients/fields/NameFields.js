import React from 'react'
import { Field } from 'redux-form'
import { __ } from '../../../i18n'
import { TextField, ToggleField } from '../../components/form'
import { rowStyle, buttonStyle, grow } from '../../components/form/rowStyle'

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

export const NameFields = ({ gender = true, titles = false }) =>
  <div style={rowStyle}>
    {
      gender &&
        <GenderField />
    }

    {
      titles &&
        <div style={grow}>
          <Field
            name='titlePrepend'
            component={TextField}
            label={__('patients.titlePrepend')} />
        </div>
    }

    <div style={grow}>
      <Field
        name='lastName'
        component={TextField}
        label={__('patients.lastName')} />
    </div>
    <div style={grow}>
      <Field
        name='firstName'
        component={TextField}
        label={__('patients.firstName')} />
    </div>

    {
      titles &&
        <div style={grow}>
          <Field
            name='titleAppend'
            component={TextField}
            label={__('patients.titleAppend')} />
        </div>
    }

  </div>
