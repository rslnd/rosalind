import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'

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
      {patient.profile.gender === 'Female' && TAPi18n.__('patients.salutationFemale')}
      {patient.profile.gender === 'Male' && TAPi18n.__('patients.salutationMale')}
    &nbsp;</span>
    {patient.profile.titlePrepend && <span>{patient.profile.titlePrepend}&nbsp;</span>}
    <b>{patient.profile.lastName}&nbsp;</b>
    {patient.profile.firstName}&nbsp;
    {patient.profile.titleAppend}
    {
      patient.profile.banned && <span>
        &ensp;
        <span title={TAPi18n.__('patients.banned')} style={dotStyle} />
      </span>
    }
  </span>
)
