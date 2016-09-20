import React from 'react'
import map from 'lodash/map'
import identity from 'lodash/identity'
import { TAPi18n } from 'meteor/tap:i18n'
import { Birthday } from './Birthday'
import { PastAppointmentsContainer } from './PastAppointmentsContainer'

export class PatientProfile extends React.Component {
  render () {
    const patient = this.props.patient
    if (!patient) {
      return <div>Patient not found</div>
    } else {
      return (
        <div>
          <h4>{patient.fullNameWithTitle()}</h4>
          {patient.profile.contacts && patient.profile.contacts.map((contact) => (
            <h4 key={contact.value}>{contact.value}</h4>
          ))}
          <p><Birthday day={patient.profile.birthday} /></p>
          {
            map(patient.profile.address).filter(identity).map((l) => <span key={l}>{l}&emsp;</span>)
          }
          {
            patient.notes && patient.notes.length > 4 &&
              <blockquote>{patient.notes}</blockquote>
          }
        </div>
      )
    }
  }
}
