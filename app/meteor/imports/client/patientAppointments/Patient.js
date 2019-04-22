import React from 'react'
import Alert from 'react-s-alert'
import { insuranceId as formatInsuranceId, prefix } from '../../api/patients/methods'
import { namecase } from '../../util/namecase'
import { birthday as formatBirthday } from '../../util/time/format'
import { __ } from '../../i18n'
import { withHandlers } from 'recompose'
import { Patients } from '../../api/patients'
import { Field, Textarea, Day } from './Field'

const action = promise =>
  promise.then(() => {
    Alert.success(__('ui.saved'))
  })

const secondary = {
  opacity: 0.6
}

const sectionStart = {
  paddingTop: 14
}

export const Patient = ({ patient }) =>
  !patient ? null : <div style={containerStyle}>
    <div style={fieldsContainerStyle}>
      <Name {...patient} />
      <Birthday {...patient} />
      <InsuranceId {...patient} />
      <Note {...patient} />
      <Address {...patient} />
    </div>
    <div style={marginBottomStyle}>
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

const marginBottomStyle = {
  marginBottom: 25
}

const fieldsContainerStyle = {
  outline: 0
}

const upsert = (props, update) =>
  action(
    Patients.actions.upsert.callPromise({
      patient: {
        _id: props._id,
        ...update
      }
    })
  )

const Name = withHandlers({
  toggleGender: props => e => action(Patients.actions.toggleGender.callPromise({ patientId: props._id })),
  updateLastName: props => lastName => upsert(props, { lastName }),
  updateFirstName: props => firstName => upsert(props, { firstName }),
  updateTitlePrepend: props => titlePrepend => upsert(props, { titlePrepend })
})(({
  gender, toggleGender,
  titlePrepend, updateTitlePrepend,
  lastName, updateLastName,
  firstName, updateFirstName
}) =>
  <div style={nameStyle}>
    <div>
      <span style={genderStyle} onClick={toggleGender}>{prefix(gender)}</span>
      <Field
        style={titleStyle}
        initialValue={titlePrepend}
        onChange={updateTitlePrepend}
      />
    </div>
    <Field
      style={lastNameStyle}
      initialValue={namecase(lastName)}
      onChange={updateLastName}
    />
    <Field
      style={firstNameStyle}
      initialValue={namecase(firstName)}
      onChange={updateFirstName}
    />
  </div>
)

const nameStyle = {
  // paddingTop: 0
}

const genderStyle = {
  ...secondary,
  opacity: 0.5,
  cursor: 'pointer',
  width: 22,
  display: 'inline-block'
}

const titleStyle = {
  ...secondary,
  width: `calc(100% - ${genderStyle.width}px)`,
  display: 'inline-block'
}

const lastNameStyle = {
  fontSize: '20px',
  fontWeight: 800
}

const firstNameStyle = {
  fontSize: '20px',
  ...secondary
}

const Birthday = withHandlers({
  updateBirthday: props => birthday => upsert(props, { birthday })
})(({ birthday, updateBirthday }) =>
  <Day
    initialValue={birthday}
    style={birthdayStyle}
    onChange={updateBirthday}
    birthday
    plain
  />
)

const birthdayStyle = {
  ...sectionStart,
  ...secondary
}

const InsuranceId = withHandlers({
  updateInsuranceId: props => insuranceId => upsert(props, { insuranceId })
})(({ insuranceId, updateInsuranceId }) =>
  <Field
    initialValue={formatInsuranceId(insuranceId)}
    onChange={updateInsuranceId}
    placeholder={__('patients.insuranceId')}
    style={secondary}
  />
)

const Note = withHandlers({
  updateNote: props => note => upsert(props, { note })
})(({ note, updateNote }) =>
  <div style={noteStyle}>
    <div style={noteLabelStyle}>{__('patients.noteLine1')}</div>
    <div style={noteLabelStyle}>&emsp;{__('patients.noteLine2')}</div>
    <Textarea
      initialValue={note}
      onChange={updateNote}
      style={noteFieldStyle}
    />
  </div>
)

const noteFieldStyle = {
  fontWeight: 600
}

const noteStyle = {
  ...sectionStart,
  fontWeight: 600
}

const noteLabelStyle = {
  fontSize: '80%',
  opacity: 0.5
}

const Address = withHandlers({
  updateAddressLine1: props => line1 => upsert(props, { address: { line1 } }),
  updateLocality: props => locality => upsert(props, { address: { locality } }),
  updatePostalCode: props => postalCode => upsert(props, { address: { postalCode } })
})(({ address, updateAddressLine1, updateLocality, updatePostalCode }) =>
  <div style={addressStyle}>
    <Field
      initialValue={address && address.line1}
      onChange={updateAddressLine1}
      placeholder={__('patients.addressLine1')}
    />

    <div>
      <Field
        initialValue={address && address.postalCode}
        onChange={updatePostalCode}
        style={postalCodeStyle}
        placeholder={__('patients.addressPostalCode')}
      />

      <Field
        initialValue={address && address.locality}
        onChange={updateLocality}
        style={localityStyle}
        placeholder={__('patients.addressLocality')}
      />
    </div>
  </div>
)

const addressStyle = {
  ...sectionStart,
  ...secondary
}

const postalCodeStyle = {
  width: 40,
  display: 'inline-block'
}

const localityStyle = {
  width: `calc(100% - ${postalCodeStyle.width}px)`,
  display: 'inline-block'
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
