import React from 'react'
import { __ } from '../../i18n'

const dotStyle = {
  display: 'inline-block',
  width: 9,
  height: 9,
  backgroundColor: 'black',
  borderRadius: '100%'
}

export const PatientName = ({ patient }) => (
  <span>
    <span className='text-muted'>
      {patient.gender === 'Female' && __('patients.salutationFemale')}
      {patient.gender === 'Male' && __('patients.salutationMale')}
    &nbsp;</span>
    {patient.titlePrepend && <span>{patient.titlePrepend}&nbsp;</span>}
    <b>{patient.lastName}&nbsp;</b>
    {patient.firstName}&nbsp;
    {patient.titleAppend}
    {
      patient.banned && <span>
        &ensp;
        <span title={__('patients.banned')} style={dotStyle} />
      </span>
    }
  </span>
)
