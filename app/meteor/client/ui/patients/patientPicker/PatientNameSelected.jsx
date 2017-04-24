import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { PatientName } from '../PatientName'

export const PatientNameSelected = ({ value }) => (
  <div className="Select-value">
    <span className="Select-value-label">
      {value.patient && <PatientName patient={value.patient} />}
      {value.newPatient && <span><Icon name="user-plus" />&nbsp;{TAPi18n.__('patients.thisNew')}</span>}
    </span>
  </div>
)
