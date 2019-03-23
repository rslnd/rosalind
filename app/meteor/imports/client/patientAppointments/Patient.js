import React from 'react'
import { insuranceId as formatInsuranceId, prefix } from '../../api/patients/methods'
import { namecase } from '../../util/namecase'
import { birthday as formatBirthday } from '../../util/time/format'

const secondary = {
  opacity: 0.6
}

const sectionStart = {
  paddingTop: 14
}

export const Patient = ({ patient }) =>
  !patient ? null : <div style={containerStyle}>
    <div>
      <Name {...patient} />
      <Birthday {...patient} />
      <InsuranceId {...patient} />
      <Note {...patient} />
      <Address {...patient} />
    </div>
    <div>
      <Loyalty {...patient} />
      <PatientActions {...patient} />
    </div>
  </div>

const containerStyle = {
  padding: 8,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
}

const Name = ({ gender, titlePrepend, lastName, firstName }) =>
  <div style={nameStyle}>
    <div><span style={genderStyle}>{prefix(gender)}</span> <span style={titleStyle}>{titlePrepend}</span></div>
    <div style={lastNameStyle}>{namecase(lastName)}</div>
    <div style={firstNameStyle}>{namecase(firstName)}</div>
  </div>

const nameStyle = {
  // paddingTop: 0
}

const genderStyle = {
  ...secondary,
  opacity: 0.5
}

const titleStyle = {
  ...secondary
}

const lastNameStyle = {
  fontSize: '20px',
  fontWeight: 800
}

const firstNameStyle = {
  fontSize: '20px',
  ...secondary
}

const Birthday = ({ birthday }) =>
  <div style={birthdayStyle}>
    {formatBirthday(birthday)}
  </div>

const birthdayStyle = {
  ...sectionStart,
  ...secondary
}

const InsuranceId = ({ insuranceId }) =>
  !insuranceId ? null : <div style={secondary}>
    {formatInsuranceId(insuranceId)}
  </div>

const Note = ({ note }) =>
  <div style={noteStyle}>
    {note}
  </div>

const noteStyle = {
  ...sectionStart,
  fontWeight: 600
}

const Address = ({ address }) =>
  !address ? null : <div style={addressStyle}>
    <div>{address.line1}</div>
    <div>{address.postalCode} {address.locality}</div>
  </div>

const addressStyle = {
  ...sectionStart,
  ...secondary
}

const Loyalty = () =>
  <div style={loyaltyStyle}>
    <div>Gesamtumsatz €6500</div>
    <div>Patientin seit Jänner 2019</div>
  </div>

const loyaltyStyle = {
  ...sectionStart,
  ...secondary
}

const PatientActions = () =>
  <div style={loyaltyStyle}>
    <div>Datenschutz akzeptiert am 12.03.2019</div>
    <div>SMS Verlauf anzeigen</div>
  </div>
