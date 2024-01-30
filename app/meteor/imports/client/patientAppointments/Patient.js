import moment from 'moment-timezone'
import { useTracker } from 'meteor/react-meteor-data'
import React, { useState } from 'react'
import Alert from 'react-s-alert'
import { insuranceId as formatInsuranceId, prefix } from '../../api/patients/methods'
import { namecase } from '../../util/namecase'
import { __ } from '../../i18n'
import { withHandlers, compose, withProps } from 'recompose'
import { Patients } from '../../api/patients'
import { Field, Textarea, Day, InsuranceId as InsuranceIdField } from './Field'
import { Consent } from '../appointments/info/Consent'
import { Agreements } from './Agreements'
import { Contacts } from './Contacts'
import { Dot } from '../patients/Dot'
import { currencyRounded } from '../../util/format'
import { FutureRecord } from '../records/FutureRecord'
import { PairingButton } from '../clients/PairingButton'
import { Pinned } from '../media/Pinned'
import { withPromise } from '../components/withPromise'
import { hasRole } from '../../util/meteor/hasRole'
import { ScanButton } from './Documents'
import { SmsModalContainer } from './SmsModal'
import { CommentsContainer } from '../comments'
import { prompt } from '../layout/Prompt'

const action = promise =>
  promise.then(() => {
    Alert.success(__('ui.saved'))
  })

const secondary = {
  color: '#444'
}

const sectionStart = {
  paddingTop: 14
}

export const Patient = ({ patient, calendar, currentAppointment, handleMediaClick }) =>
  !patient ? null : <div style={containerStyle}>
    <div style={innerContainerStyle}>
      <div style={fieldsContainerStyle}>
        <Name {...patient} calendar={calendar} />
        <Birthday {...patient} />
        <InsuranceId {...patient} />
        <Contacts {...patient} />
        <Address {...patient} />
        <Loyalty {...patient} />
      </div>
      <div style={marginBottomStyle}>
        <Note {...patient} />
        <FutureRecord
          patientId={patient._id}
          calendarId={currentAppointment ? currentAppointment.calendarId : null}
          currentAppointment={currentAppointment}
          style={noteLabelStyle}
          fieldStyle={noteFieldStyle} />
      </div>
      <div style={marginBottomStyle}>
        {/* Legacy, keep showing previously agreed but all future agreements should be scanned documents */}
        {/* <Toggles showOnly='pending' patient={patient} currentAppointment={currentAppointment} /> */}

        <Toggles showOnly='agreed' patient={patient} currentAppointment={currentAppointment} />
        <PatientActions {...patient} />
        <PairingButton />
        <ScanButton
          isCurrent
          pinned
          patientId={patient._id}
          appointmentId={currentAppointment ? currentAppointment._id : null}
        >Dokument scannen</ScanButton>
      </div>
    </div>
    <Pinned
      patientId={patient._id}
      handleMediaClick={handleMediaClick}
      style={pinnedMediaStyle}
    />
  </div>

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
}

const innerContainerStyle = {
  padding: 20
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

const Name = compose(
  withProps(props => ({
    canBan: (
      (props.calendar &&
      props.calendar.allowBanningPatients) ||
      hasRole(Meteor.userId(), ['admin', 'patients-ban']))
  })),
  withHandlers({
    toggleGender: props => e => action(Patients.actions.toggleGender.callPromise({ patientId: props._id })),
    updateLastName: props => lastName => upsert(props, { lastName }),
    updateFirstName: props => firstName => upsert(props, { firstName }),
    updateTitlePrepend: props => titlePrepend => upsert(props, { titlePrepend }),
    updateLabel: props => label => upsert(props, { label }),
    toggleBanned: props => e => upsert(props, { banned: !props.banned })
  })
)(({
  gender, toggleGender,
  titlePrepend, updateTitlePrepend,
  label, updateLabel,
  lastName, updateLastName,
  firstName, updateFirstName,
  banned, toggleBanned, canBan
}) =>
  <div style={nameStyle}>
    <div className='flex'>
      <div className='flex-grow'>
        <div>
          <span style={genderStyle} onClick={toggleGender}>{prefix(gender)}</span>
          <Field
            style={titleStyle}
            initialValue={titlePrepend}
            onChange={updateTitlePrepend}
            className='placeholder-light'
            placeholder={'Titel'}
          />
          <Field
            style={titleStyle}
            initialValue={label}
            onChange={updateLabel}
            className='placeholder-light'
            placeholder={'Zusatz'}
          />

        </div>
        <Field
          style={lastNameStyle}
          initialValue={namecase(lastName)}
          onChange={updateLastName}
          title={namecase(lastName)}
          placeholder={'(Nachname)'}
        />
        <div style={bannedStyle}>
          <Field
            style={firstNameStyle}
            initialValue={namecase(firstName)}
            title={namecase(firstName)}
            onChange={updateFirstName}
            placeholder={'(Vorname)'}
          />
        </div>
      </div>
      <div className='flex-shrink'>
        {canBan &&
          <Dot
            banned={banned}
            canBan={canBan}
            onClick={toggleBanned}
          />
        }
      </div>
    </div>
  </div>
)

const nameStyle = {
  // paddingTop: 0
}

const bannedStyle = {
  display: 'flex',
  justifyContent: 'space-between'
}

const genderStyle = {
  ...secondary,
  cursor: 'pointer',
  width: 22,
  display: 'inline-block',
  minHeight: '1em'
}

const titleStyle = {
  ...secondary,
  width: 70,
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
    placeholder={__('patients.birthday')}
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
})(({ insuranceId, isPrivateInsurance, updateInsuranceId }) =>
  <div className='flex justify-between'>
    <InsuranceIdField
      initialValue={formatInsuranceId(insuranceId)}
      onChange={updateInsuranceId}
      placeholder={__('patients.insuranceId')}
      style={secondary}
    />

    <span className='text-muted pr3'>
      {isPrivateInsurance && __('patients.privateInsurance')}
    </span>
  </div>
)

const Note = (props) => {
  const { _id, note } = props
  const updateNote = newNote => upsert(props, { note: newNote })

  const { canComment, canSeeNote, canEditNote } = useTracker(() => {
    const canComment = hasRole(Meteor.userId(), ['patient-comments'])
    const canSeeNote = hasRole(Meteor.userId(), ['patient-note', 'patient-note-edit'])
    const canEditNote = hasRole(Meteor.userId(), ['patient-note-edit'])
    return { canComment, canSeeNote, canEditNote }
  })

  return ((canComment || canSeeNote) &&
    <div style={noteStyle}>
      <div style={noteLabelStyle}>{__('patients.noteLine1')}</div>
      <div style={noteLabelStyle}>&emsp;{__('patients.noteLine2')}</div>

      {canSeeNote &&
        (canEditNote
        ? <Textarea
          initialValue={note}
          onChange={updateNote}
          style={noteFieldStyle}
        />
        : note)
      }

      {canComment && <CommentsContainer docId={_id} />}
    </div>
  )
}

const noteFieldStyle = {
  fontWeight: 600,
  background: '#fff',
  borderRadius: '4px',
  marginTop: 6,
  marginBottom: 14,
  padding: 10
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


const fetchLoyalty = ({ _id }) =>
  new Promise((resolve) => {
    Meteor.call(
      'patients/getLoyalty',
      { patientId: _id },
      (err, loyalty) => {
        resolve(loyalty)
      })
  })

const Loyalty = withPromise(fetchLoyalty)(({ patientSince, totalRevenue, patientId, gender, portalVerifiedAt, _id }) =>
  <div style={loyaltyStyle}>
    {
      _id === patientId && // avoid stale data when opening/closing modal quickly
      <div className='enable-select'>
        <div>{
          totalRevenue
            ? __('patients.totalRevenue', { revenue: currencyRounded(totalRevenue) })
            : null
        } </div>
        <div>{
          patientSince
            ? __(gender === 'Female' ? 'patients.patientSince_female' : 'patients.patientSince_male', { date: formatPatientSince(patientSince) })
            : null
        }</div>
      </div>
    }
    <div onClick={async () => {
      const yes = await prompt({ title: 'Möchten Sie den Zugang für Online Befund- und Bildabfrage wieder sperren?',
    confirm: 'Sperren'})
      if (yes) {
        Patients.actions.unsetPortalVerified.callPromise({ patientId: _id })
      }
    }}>
      {
        portalVerifiedAt
        ? __('patients.portalVerified')
        : null
      }
    </div>
  </div>
)

const formatPatientSince = d =>
  moment(d).format(__('time.dateFormatMonthYearOnly'))

const loyaltyStyle = {
  ...sectionStart,
  ...secondary
}

const PatientActions = (patient) => {
  const [isSmsOpen, setSmsOpen] = useState(false)

  const handleSmsOpen = (e) => {
    e.preventDefault()
    setSmsOpen(true)
  }

  return <>
    <div style={loyaltyStyle}>
      <a href='#' onClick={handleSmsOpen}>
        SMS Verlauf
      </a>
    </div>

    {
      isSmsOpen && <SmsModalContainer
        patient={patient}
        onClose={() => setSmsOpen(false)}
      />
    }
  </>
}

export const Toggles = ({ patient, currentAppointment, showOnly }) => {
  if (!currentAppointment) { return null }

  return <div style={showOnly === 'agreed' ? secondary : null}>
    <Consent plain showOnly={showOnly} appointment={currentAppointment} />
    <Agreements showOnly={showOnly} patient={patient} calendarId={currentAppointment.calendarId} />
  </div>
}

const pinnedMediaStyle = {
  borderRadius: 'none'
}
