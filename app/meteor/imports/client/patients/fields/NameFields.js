import React from 'react'
import { Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { ToggleField } from '../../components/form/ToggleField'

export const NameFields = () =>
  <div className='row no-pad' style={{ marginTop: -10, zIndex: 19 }}>
    <div className='col-md-1'>
      <div style={{ textAlign: 'center' }}>
        <Field
          name='gender'
          component={ToggleField}
          style={{ minWidth: 31, marginTop: 32 }}
          values={[
            { value: 'Female', label: TAPi18n.__('patients.salutationFemale') },
            { value: 'Male', label: TAPi18n.__('patients.salutationMale') }
          ]} />
      </div>
    </div>
    <div className='col-md-5'>
      <div>
        <Field
          name='lastName'
          component={TextField}
          fullWidth
          floatingLabelText={TAPi18n.__('inboundCalls.form.lastName.label')} />
      </div>
    </div>
    <div className='col-md-5'>
      <div>
        <Field
          name='firstName'
          component={TextField}
          fullWidth
          autoFocus
          floatingLabelText={TAPi18n.__('inboundCalls.form.firstName.label')} />
      </div>
    </div>
  </div>
