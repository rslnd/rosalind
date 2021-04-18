import React from 'react'
import { namecase } from '../../util/namecase'
import { __ } from '../../i18n'
import { prefix } from '../../api/patients/methods/name'

const dotStyle = {
  display: 'inline-block',
  width: 9,
  height: 9,
  backgroundColor: 'black',
  borderRadius: '100%'
}

export const PatientName = ({ patient = {}, style, bannedIndicator = false }) => (
  <span style={style}>
    <span className='text-muted'>
      {prefix(patient)}
      &nbsp;
      {patient.titlePrepend && <span>{patient.titlePrepend}&nbsp;</span>}
    </span>
    <b>{namecase(patient.lastName)}&nbsp;</b>
    {namecase(patient.firstName)}&nbsp;
    {patient.titleAppend}
    {
      patient.label &&
        <span className='text-muted'>&ensp;{patient.label}</span>
    }
    {
      patient.banned && bannedIndicator && <span>
        &ensp;
        <span title={__('patients.banned')} style={dotStyle} />
      </span>
    }
  </span>
)
