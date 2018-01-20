import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { ToggleField } from '../../components/form/ToggleField'
import { rowStyle, buttonStyle, grow } from '../../components/form/rowStyle'

export const NameFields = () =>
  <div style={rowStyle}>
    <div style={buttonStyle}>
      <Field
        name='gender'
        component={ToggleField}
        style={{ minWidth: 31 }}
        values={[
          { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
          { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
        ]} />
    </div>
    <div style={grow}>
      <Field
        name='lastName'
        component={TextField}
        fullWidth
        floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
    </div>
    <div style={grow}>
      <Field
        name='firstName'
        component={TextField}
        fullWidth
        autoFocus
        floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
    </div>
  </div>
