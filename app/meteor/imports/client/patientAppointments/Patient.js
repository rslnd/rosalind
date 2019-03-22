import React from 'react'

const secondary = {
  opacity: 0.6
}

const sectionStart = {
  paddingTop: 14
}

export const Patient = () =>
  <div style={containerStyle}>
    <Name />
    <Birthday />
    <InsuranceId />
    <Note />
    <Address />
    <Loyalty />
  </div>

const containerStyle = {
  padding: 12
}

const Name = () =>
  <div style={nameStyle}>
    <div><span style={genderStyle}>Fr.</span> <span style={titleStyle}>Dr. med.</span></div>
    <div style={lastNameStyle}>Grotten-Sormann</div>
    <div style={firstNameStyle}>Brunhilda Osvaldå</div>
  </div>

const nameStyle = {
  // paddingTop: 0
}

const genderStyle = {
  ...secondary
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

const Birthday = () =>
  <div style={birthdayStyle}>
    66 Jahre (1. Jänner 1953)
  </div>

const birthdayStyle = {
  ...sectionStart,
  ...secondary
}

const InsuranceId = () =>
  <div style={secondary}>
    1234 120398
  </div>

const Note = () =>
  <div style={noteStyle}>
    Allergisch auf XYZ und Cefaclor/Ceclor
  </div>

const noteStyle = {
  ...sectionStart
}

const Address = () =>
  <div style={addressStyle}>
    <div>Stephansplatz 1</div>
    <div>1010 Wien</div>
  </div>

const addressStyle = {
  ...sectionStart,
  ...secondary
}

const Loyalty = () =>
  <div style={loyaltyStyle}>
    <div>Patientin seit Jänner 2019</div>
    <div>Gesamtumsatz €6500</div>
  </div>

const loyaltyStyle = {
  ...sectionStart,
  ...secondary
}
