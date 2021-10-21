import React, { useState } from 'react'
import Alert from 'react-s-alert'
import { compose, withState, withHandlers } from 'recompose'
import { __ } from '../../i18n'
import moment from 'moment-timezone'
import { PatientName } from '../patients/PatientName'
import { Media, Appointments, Patients, MediaTags as MediaTagsAPI } from '../../api'
import { withTracker } from '../components/withTracker'
import { Icon } from '../components/Icon'
import { Explorer } from './Explorer'
import { darken, getStyleNonce } from '../layout/styles'
import Select from 'react-select'
import identity from 'lodash/identity'
import range from 'lodash/range'
import uniq from 'lodash/uniq'
import { patientCyclesNames } from './Cycles'
import { MediaTags } from './MediaTags'
import { hasRole } from '../../util/meteor/hasRole'
import { prompt } from '../layout/Prompt'
import { QRCode } from 'react-qr-svg'
import { dayToDate } from '../../util/time/day'
import { isMobileNumber } from '../../api/messages/methods/isMobileNumber'

const composer = (props) => {
  const { patientId, media, selector, setSelector } = props
  const patient = Patients.findOne({ _id: patientId })
  const currentMediaId = media._id

  let prevMediaId = null
  let nextMediaId = null

  const baseSelector =  { patientId: patient._id }
  const { appointmentSelector, label, ...mediaSelector } = selector // Separate selectors: appointments and media
  const combinedMediaSelector = selector
    ? ({...mediaSelector, ...baseSelector })
    : (cycle
      ? { ...baseSelector, kind: media.kind, cycle }
      : { ...baseSelector, kind: media.kind })

  console.log('[Sidebar] combined media selector', combinedMediaSelector)

  const allMedia = Media.find(combinedMediaSelector, { sort: { createdAt: 1 } }).fetch()

  // group by months and add relevant appointment
  const { sections } = allMedia.reduce((acc, media, i) => {
    const m = moment(media.createdAt)
    const currentMonth = m.format(__('time.dateFormatMonthYearOnly'))
    const currentAppointmentId = media.appointmentId

    if (!prevMediaId && media._id === currentMediaId) {
      prevMediaId = allMedia[i - 1] && allMedia[i - 1]._id
      nextMediaId = allMedia[i + 1] && allMedia[i + 1]._id
    }

    let sectionsToAdd = []

    if (currentMonth !== acc.currentMonth) {
      sectionsToAdd.push({
        monthSeparator: currentMonth,
        key: currentMonth,
        m
      })
    }

    if (currentAppointmentId &&
        (currentAppointmentId !== acc.currentAppointmentId)) {
      const baseSelector = { _id: currentAppointmentId }
      const selector = appointmentSelector ? { ...baseSelector, ...appointmentSelector } : baseSelector
      const appointment = Appointments.findOne(selector)

      if (appointment) {
        sectionsToAdd.push({
          appointment,
          key: appointment._id + media._id
        })
      } else {
        // Skip media if appointment selector does not match
        return acc
      }
    }

    const sections = [
      ...acc.sections,
      ...sectionsToAdd,
      { media }
    ]

    return {
      currentMonth,
      currentAppointmentId,
      sections
    }
  }, { currentMonth: null, currentAppointmentId: null, sections: [] })

  // select some "next" media when removing currently viewed media, or close modal if none left
  const handleRemove = (mediaId) => {
    props.setCurrentMediaId(prevMediaId || nextMediaId)
    Media.actions.remove.callPromise({ mediaId })
      .then(() => Alert.success(__('ui.deleted')))
  }

  return {
    ...props,
    cycle: selector.cycle || media.cycle,
    patient,
    sections,
    prevMediaId,
    nextMediaId,
    setSelector,
    selector,
    handleRemove
  }
}

const Selector = ({ selector, setSelector, patientId, appointmentId }) => {
  const allMedia = Media.find({ patientId }).fetch()
  const maxCycle = Math.max(...allMedia.map(m => m.cycle).filter(identity))
  const cycles = (maxCycle >= 1)
    ? patientCyclesNames(patientId).map(cycle => ({
      label: `Sitzung ${cycle}`,
      value: { cycle: String(cycle) }
    }))
    : []

  const mediaTagIds = uniq(allMedia
    .map(m => m.tagIds && m.tagIds[0])
    .filter(identity))
  const usedMediaTags = mediaTagIds
    .map(_id => MediaTagsAPI.findOne({
      _id,
      isHiddenInFilter: { $ne: true }
    }))
    .filter(identity)
    .map(mt => ({
      label: mt.namePlural,
      value: { tagIds: mt._id }
    }))

  const options = [
    { label: 'Alle Fotos', value: { kind: 'photo'} },
    { label: 'Alle Dokumente', value: { kind: 'document'} },
    { label: 'Dieser Termin', value: { appointmentId } },

    ...usedMediaTags,
    ...cycles
  ]

  const handleChange = ({ value }) => {
    // const appointmentSelector = {}
    console.log('[Sidebar] setting selector', value)
    setSelector(value)
  }

  return <div style={selectStyle}>
    <Select
      value={selector.label}
      options={options}
      onChange={handleChange}
      ignoreCase
      nonce={getStyleNonce()}
      styles={{ menuPortal: base => ({
        ...base,
        filter: selectStyle.filter,
        zIndex: 3000
      })}}
      menuPortalTarget={document.body}
      placeholder='Filter...'
    />
  </div>
}

const selectStyle = {
  filter: 'invert(0.8) grayscale(1)',
  padding: 5,
  color: '#000'
}

export const Sidebar = compose(
  withState('selector', 'setSelector', {}),
  withTracker(composer)
)(({
  patient,
  appointmentId,
  sections,
  media,
  prevMediaId,
  nextMediaId,
  cycle,
  setCurrentMediaId,
  selector,
  setSelector,
  handleRemove
}) =>
  <div style={containerStyle}>
    <PatientName
      patient={patient}
      style={patientNameStyle}
    />

    <Selector
      patientId={patient._id}
      appointmentId={appointmentId}
      selector={selector}
      setSelector={setSelector}
    />

    <Explorer
      sections={sections}
      style={explorerStyle}
      setCurrentMediaId={setCurrentMediaId}
      currentMediaId={media._id}
    />
    <MediaTags media={media} singleTag />
    <Edit media={media} handleRemove={handleRemove} setCurrentMediaId={setCurrentMediaId} />
    <Navigation
      setCurrentMediaId={setCurrentMediaId}
      prevMediaId={prevMediaId}
      nextMediaId={nextMediaId}
    />
  </div>
)

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(50,50,50,0.8)',
  height: '100%',
  justifyContent: 'space-between'
}

const patientNameStyle = {
  padding: 10,
  display: 'inline-block'
}

const cycleStyle = {
  padding: 10,
  display: 'inline-block',
  opacity: 0.9
}

const explorerStyle = {
  flex: 1,
  height: '100%',
  overflowY: 'auto'
}

const imageUrlToBase64 = (url) => new Promise((resolve, reject) => {
  // Soruce: https://base64.guru/developers/javascript/examples/encode-remote-file
  // To bypass errors (“Tainted canvases may not be exported” or “SecurityError: The operation is insecure”)
  // The browser must load the image via non-authenticated request and following CORS headers
  const img = new Image()
  img.crossOrigin = 'Anonymous'

  img.onload = function () {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.height = img.naturalHeight
    canvas.width = img.naturalWidth
    ctx.drawImage(img, 0, 0)

    // Unfortunately, we cannot keep the original image type, so all images will be converted to JPEG
    // For this reason, we cannot get the original Base64 string
    const uri = canvas.toDataURL('image/jpeg');
    const b64 = uri.replace(/^data:image.+;base64,/, '')

    resolve(b64)
  }

  img.onerror = reject

  // If you are loading images from a remote server, be sure to configure “Access-Control-Allow-Origin”
  // For example, the following image can be loaded from anywhere.
  img.src = url
})


const Edit = ({ media, handleRemove, setCurrentMediaId }) => {
  const [sharing, setSharing] = useState(false)

  const handleRotate = e => {
    console.log('rotate', (((media.rotation || 0) + 90) % 360))
    Media.actions.update.callPromise({
      mediaId: media._id,
      update: {
        rotation: (((media.rotation || 0) + 90) % 360)
      }
    })
  }

  const handleShare = async (e) => {
      try {
      const patientId = media.patientId

      const patient = Patients.findOne({ _id: patientId })

      if (!patient) {
        Alert.error(__('media.noPatientAssigned'))
        return
      }

      if (patient.noSMS) {
        Alert.error(__('patient.noSMSnoPortal'))
        return
      }

      if (!patient.portalVerifiedAt ||
          !patient.portalVerifiedBy ||
          moment(patient.portalVerifiedAt).isBefore(moment().subtract(1, 'year'))) {

          // Verify patient data for portal access
          const phone = patient.contacts.find(c =>
            c.value &&
            c.valueNormalized &&
            c.channel === 'Phone' &&
            isMobileNumber(c.value)
          )

          if (!phone) {
            Alert.error(__('patients.noValidMobileNumber'))
            return
          }

          if (!patient.firstName || !patient.lastName || !patient.birthday) {
            Alert.error(__('patients.pleaseCheckProfile'))
            return
          }

          if (!patient.insuranceId) {
            Alert.error(__('patients.insuranceIdRequired'))
            return
          }

          const body =
          <>
            <p>
              Um Befunde und Bilder online abzurufen müssen die bestätigten Daten exakt eingegeben werden.
            </p>
            <p>
              Vorname: <b>{patient.firstName}</b><br />
              Nachname: <b>{patient.lastName}</b><br />
              Geburtsdatum: <b>{moment(dayToDate(patient.birthday)).format(__('time.dateFormatVeryShort'))}</b><br />
              Sozialversicherungsnummer: <b>{patient.insuranceId}</b><br />
              Mobiltelefonnummer: <b>{phone.valueNormalized}</b><br />
            </p>
          </>

          // temporarily hide media overlay to avoid z-index problems with prompt modal
          setCurrentMediaId(null)
          const ok = await prompt({
            title: 'Bitte bestätigen Sie die Stammdaten',
            body,
            confirm: 'Daten sind korrekt',
            cancel: 'Abbrechen'
          })

          if (ok) {
            setCurrentMediaId(media._id)

            await Patients.actions.setPortalVerified.callPromise({
              patientId,
              phone: phone.valueNormalized
            })

            Alert.success(__('patients.portalVerifiedSuccess'))
          } else {
            Alert.warning(__('patients.pleaseUpdateProfile'))
            return
          }
      }

      Alert.info('Hochladen...')
      const b64 = await imageUrlToBase64(media.urls[0])
      await Media.actions.portalPublish.callPromise({
        mediaId: media._id,
        b64
      })

      Alert.success(__('patients.portalUploadSuccess'))
    } catch (e) {
      console.error('Sidebar shareMedia error', e)
      Alert.error(__('ui.tryAgain'))
    }

    setSharing(!sharing)
  }

  return <>
    {
      sharing &&
        <div style={qrContainerStyle} onClick={handleShare}>
          {/* <div style={qrInnerStyle}>
            <QRCode
              style={{
                width: 230,
                height: 230
              }}
              size={230}
              fgColor={'#000000'}
              value={media.urls[0]}
            />
          </div> */}
        </div>
    }
    <div style={editStyle}>
      <Button onClick={() => handleRemove(media._id)}><Icon name='trash-o' /></Button>
      {/* <Button><Icon name='crop' /></Button> */}
      <Button onClick={handleRotate}><Icon name='retweet' /></Button>

      {hasRole(Meteor.userId(), ['ff-share-media']) &&
        <Button onClick={handleShare}><Icon name='paper-plane' /></Button>
      }
    </div>
  </>
}

const qrContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const qrInnerStyle = {
  backgroundColor: 'white',
  padding: 6
}

const editStyle = {
  display: 'flex',
  height: 56
}

const Navigation = ({ setCurrentMediaId, prevMediaId, nextMediaId }) =>
  <div style={navigationStyle}>
    <Button
      disabled={!prevMediaId}
      onClick={() => setCurrentMediaId(prevMediaId)}
    >
      <Icon name='chevron-left' />
    </Button>

    <Button
      disabled={!nextMediaId}
      onClick={() => setCurrentMediaId(nextMediaId)}
    >
      <Icon name='chevron-right' />
    </Button>
  </div>

const navigationStyle = {
  display: 'flex',
  height: 70
}

const Button = withState('hover', 'setHover')(({
  children,
  hover,
  setHover,
  disabled = false,
  onClick,
  ...props
}) =>
  <div
    style={disabled ? buttonDisabledStyle : (hover ? buttonHoverStyle : buttonStyle)}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    onClick={e => (!disabled && onClick(e))}
    {...props}
  >
    <div style={buttonInnerStyle}>
      {children}
    </div>
  </div>
)

const buttonStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  cursor: 'pointer'
}

const buttonInnerStyle = {
  textAlign: 'center',
  flex: 1
}

const buttonHoverStyle = {
  ...buttonStyle,
  opacity: 1,
  backgroundColor: 'rgba(255,255,255,0.1)'
}

const buttonDisabledStyle = {
  ...buttonStyle,
  opacity: 0.2,
  cursor: 'auto'
}
