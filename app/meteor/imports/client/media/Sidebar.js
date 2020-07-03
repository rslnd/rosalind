import React from 'react'
import { compose, withState, withHandlers } from 'recompose'
import { __ } from '../../i18n'
import moment from 'moment-timezone'
import { PatientName } from '../patients/PatientName'
import { Media, Appointments, Patients } from '../../api'
import { withTracker } from '../components/withTracker'
import { Icon } from '../components/Icon'
import { MediaTags } from './MediaTags'
import { Explorer } from './Explorer'

const composer = (props) => {
  const { patientId, media, selector, setSelector } = props
  const patient = Patients.findOne({ _id: patientId })
  const currentMediaId = media._id

  let prevMediaId = null
  let nextMediaId = null

  const cycle = media.cycle

  const baseSelector =  { patientId: patient._id }
  const { appointmentSelector, ...mediaSelector } = selector // Separate selectors: appointments and media
  const combinedMediaSelector = selector && ({...selector, ...baseSelector }) || (cycle
    ? { ...baseSelector, kind: media.kind, cycle }
    : { ...baseSelector, kind: media.kind })

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
        m
      })
    }

    if (currentAppointmentId &&
        (currentAppointmentId !== acc.currentAppointmentId)) {
      const baseSelector = { _id: currentAppointmentId }
      const selector = appointmentSelector ? { ...baseSelector, ...appointmentSelector } : baseSelector
      const appointment = Appointments.findOne(selector)

      if (appointment) {
        sectionsToAdd.push({ appointment })
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

  console.log(sections)

  return {
    ...props,
    cycle,
    patient,
    sections,
    prevMediaId,
    nextMediaId,
    setSelector,
    selector
  }
}

const Selector = ({selector, setSelector}) => {
  return <div>
    <div onClick={() => setSelector({ appointmentSelector: { tags: 'HKtpQEatMSWzDryDp' } })}>Botox/Hyaluronsäure</div>
    <div onClick={() => setSelector({ tagIds: 'PAygq5yeQRfD8iFpm' })}>Reverse</div>
    <div onClick={() => setSelector({ kind: 'document'})}>Dokumente</div>
    <div onClick={() => setSelector({ kind: 'photo'})}>Fotos</div>
    <div onClick={() => setSelector({})}>Alles anzeigen</div>

    Selector: {JSON.stringify(selector)}
  </div>
}

export const Sidebar = compose(
  withState('selector', 'setSelector', {}),
  withTracker(composer)
)(({
  patient,
  sections,
  media,
  prevMediaId,
  nextMediaId,
  cycle,
  setCurrentMediaId,
  selector,
  setSelector
}) =>
  <div style={containerStyle}>
    <PatientName
      patient={patient}
      style={patientNameStyle}
    />

    {/* <Selector selector={selector} setSelector={setSelector} /> */}

    {
      cycle &&
        <div style={cycleStyle}>
          Sitzung {cycle}
        </div>
    }

    <Explorer
      sections={sections}
      style={explorerStyle}
      setCurrentMediaId={setCurrentMediaId}
      currentMediaId={media._id}
    />
    <MediaTags media={media} />
    <Edit media={media} />
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

const Edit = withHandlers({
  handleRotate: ({ media }) => e => {
    console.log('rotate', (((media.rotation || 0) + 90) % 360))
    Media.actions.update.callPromise({
      mediaId: media._id,
      update: {
        rotation: (((media.rotation || 0) + 90) % 360)
      }
    })
  }
})(({ handleRotate }) =>
  <div style={editStyle}>
    <Button><Icon name='trash-o' /></Button>
    {/* <Button><Icon name='crop' /></Button> */}
    <Button onClick={handleRotate}><Icon name='retweet' /></Button>
  </div>
)

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
  height: 90
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
