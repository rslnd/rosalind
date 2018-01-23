import React from 'react'
import { Field } from 'redux-form'
import { TAPi18n } from 'meteor/tap:i18n'
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
        { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
        { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
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
            label={TAPi18n.__('patients.titlePrepend')} />
        </div>
    }

    <div style={grow}>
      <Field
        name='lastName'
        component={TextField}
        label={TAPi18n.__('patients.lastName')} />
    </div>
    <div style={grow}>
      <Field
        name='firstName'
        component={TextField}
        autoFocus
        label={TAPi18n.__('patients.firstName')} />
    </div>

    {
      titles &&
        <div style={grow}>
          <Field
            name='titleAppend'
            component={TextField}
            label={TAPi18n.__('patients.titleAppend')} />
        </div>
    }

  </div>
