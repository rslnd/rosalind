import React from 'react'
import namecase from 'namecase'
import { __ } from '../../i18n'
import { prefix } from '../../api/patients/methods/name'

const dotStyle = {
  display: 'inline-block',
  width: 9,
  height: 9,
  backgroundColor: 'black',
  borderRadius: '100%'
}

export const PatientName = ({ patient = {} }) => (
  <span>
    <span className='text-muted'>
      {prefix(patient)}
      &nbsp;
      {patient.titlePrepend && <span>{patient.titlePrepend}&nbsp;</span>}
    </span>
    <b>{namecase(patient.lastName)}&nbsp;</b>
    {namecase(patient.firstName)}&nbsp;
    {patient.titleAppend}
    {
      patient.banned && <span>
        &ensp;
        <span title={__('patients.banned')} style={dotStyle} />
      </span>
    }
  </span>
)
