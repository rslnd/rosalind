import React from 'react'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { PatientName } from './PatientName'

export const PatientNameSelected = ({ value }) => (
  <div className='Select-value'>
    <span className='Select-value-label'>
      {value.patient && <PatientName patient={value.patient} />}
      {value.newPatient && <span><Icon name='user-plus' />&nbsp;{__('patients.thisNew')}</span>}
    </span>
  </div>
)
