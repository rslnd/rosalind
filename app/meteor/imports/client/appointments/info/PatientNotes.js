import React from 'react'
import { Field } from 'redux-form'
import { Icon } from '../../components/Icon'
import { grow, rowStyle, shrink, TextField, ToggleField, iconStyle } from '../../components/form'
import { Dot } from '../../patients/Dot'
import { __ } from '../../../i18n'

export const PatientNotes = ({ patient }) => (
  <div style={rowStyle}>
    <div style={iconStyle}>
      <Icon name='user-plus' />
    </div>
    <div style={{...grow, backgroundColor: patient.note ? '#FFF9C4' : ''}}>
      <Field
        name='note'
        component={TextField}
        multiline
        rows={1}
        rowsMax={5}
        label={__('patients.note')}
      />
    </div>

    <div style={shrink}>
      <Field
        name='banned'
        component={ToggleField}
        button={false}
        style={{ marginTop: 15, marginLeft: 20 }}
        values={[
          { value: false, label: <Dot /> },
          { value: true, label: <Dot banned /> }
        ]} />
    </div>
  </div>
)
