import React from 'react'
import { compose, withState, withProps, withHandlers, withPropsOnChange } from 'recompose'
import { Icon } from '../components/Icon'
import { lighterMutedBackground } from '../layout/styles'
import { __ } from '../../i18n'
import { Filter } from './Filter'
import { ReferralsContainer } from '../referrals/ReferralsContainer'
import { Info, dateColumnStyle } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'

export const Appointments = compose(
  withState('scrollRef', 'setScrollRef'),
  withHandlers({
    scrollToBottom: props => e => window.requestAnimationFrame(() => {
      if (props.scrollRef) {
        props.scrollRef.scrollTop = Number.MAX_SAFE_INTEGER
      }
    })
  }),
  withPropsOnChange(
    ['show'],
    props => props.scrollToBottom()
  )
)(({
  currentAppointment,
  pastAppointments,
  futureAppointments,
  fullNameWithTitle,
  setScrollRef,
  scrollToBottom,
  show,
  ...props
}) =>
  <div style={containerStyle}>
    <div style={floatingStyle}>
      <div style={shadowStyle}>
        <Filter {...props} />
      </div>
    </div>
    <div ref={setScrollRef} style={appointmentsContainerStyle}> {/* Scroll this to bottom */}
      <div style={appointmentsContainerInnerStyle}> {/* Inside this div things will not be reversed */}
        {
          pastAppointments.length > 6 &&
          <Oldest />
        }
        <AppointmentsList
          appointments={pastAppointments}
          fullNameWithTitle={fullNameWithTitle}
        />
        {
          pastAppointments.length > 1 &&
          <Current />
        }
        <Appointment
          key='current'
          appointment={currentAppointment}
          fullNameWithTitle={fullNameWithTitle}
          isCurrent
        />
        <Referrals appointment={currentAppointment} />
        <Future
          futureAppointments={futureAppointments}
          fullNameWithTitle={fullNameWithTitle}
          scrollToBottom={scrollToBottom}
          show={show}
        />
      </div>
    </div>
  </div>
)

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}

const floatingStyle = {
  position: 'absolute',
  width: '67%',
  top: 0,
  zIndex: 3,
  height: 28,
  pointerEvents: 'none'
}

const shadowStyle = {
  position: 'relative',
  width: '100%',
  height: 25,
  background: 'linear-gradient(hsla(220, 8%, 52%, 0.37) 0%, rgba(0, 0, 0, 0) 100%)',
  pointerEvents: 'none',
  borderRadius: '4px 0 0 0'
}

export const AppointmentsList = ({ appointments, fullNameWithTitle }) =>
  appointments.map(a =>
    <Appointment
      key={a._id}
      appointment={a}
      hasMedia={!!a.note}
      fullNameWithTitle={fullNameWithTitle}
    />
  )

const Appointment = ({ isCurrent, hasMedia, appointment, fullNameWithTitle }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : appointmentStyle
  }>
    <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} />
    <Tags {...appointment} tiny={!isCurrent} />
    <Note {...appointment} />

    {
      hasMedia &&
      <Media />
    }
  </div>

const appointmentsContainerStyle = {
  flex: 1,
  position: 'relative',
  maxHeight: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column-reverse'
}

const appointmentsContainerInnerStyle = {
  paddingTop: 50
}

const appointmentStyle = {
  borderRadius: 4,
  background: lighterMutedBackground,
  margin: 12
}

const currentAppointmentStyle = {
  ...appointmentStyle,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5,
  background: '#fff'
}

const Media = () =>
  <div style={mediaBackgroundStyle}>
    &nbsp;
  </div>

const mediaBackgroundStyle = {
  height: 120,
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  borderRadius: `0 0 ${appointmentStyle.borderRadius}px ${appointmentStyle.borderRadius}px`
}

const Oldest = () =>
  <div style={separatorHeadingStyle}>
    {__('appointments.oldestAppointment')}
  </div>

const separatorHeadingStyle = {
  paddingTop: 55,
  paddingLeft: dateColumnStyle.width + 12 + 12, // Fake same column as assignee name
  opacity: 0.3
}

const Current = () =>
  <div style={currentStyle}>
    {__('appointments.thisCurrent')}
  </div>

const currentStyle = {
  ...separatorHeadingStyle,
  paddingLeft: separatorHeadingStyle.paddingLeft + currentAppointmentStyle.paddingLeft,
  paddingTop: 25
}

const Future = compose(
  withState('expanded', 'setExpanded', false),
  withPropsOnChange(
    ['show'],
    props => props.setExpanded(false)
  ),
  withProps(props => {
    const count = props.futureAppointments.length
    if (count === 0) { return null }

    const key = [
      'appointments.futureToggle',
      props.expanded ? 'Hide' : 'Show'
    ].join('')

    const icon = props.expanded ? 'caret-down' : 'caret-right'

    return {
      toggleLabel: __(key, { count }),
      icon
    }
  }),
  withHandlers({
    handleExpand: props => e => {
      if (props.futureAppointments.length > 0) {
        props.setExpanded(!props.expanded)
        props.scrollToBottom()
      }
    }
  })
)(({
  expanded,
  handleExpand,
  toggleLabel,
  futureAppointments,
  fullNameWithTitle,
  icon
}) =>
  <>
    <div
      style={
        expanded
          ? futureHeaderExpandedStyle
          : futureHeaderStyle
      }
      onClick={handleExpand}
    >
      {icon && <Icon name={icon} style={caretStyle} />}&nbsp;{toggleLabel}
    </div>
    {
      expanded &&
      <AppointmentsList
        appointments={futureAppointments}
        fullNameWithTitle={fullNameWithTitle}
      />
    }
  </>
)

const caretStyle = {
  marginRight: 4
}

const futureHeaderStyle = {
  ...separatorHeadingStyle,
  paddingTop: 25,
  height: 80
}

const futureHeaderExpandedStyle = {
  ...futureHeaderStyle,
  height: 46
}

const Referrals = ({ appointment }) =>
  !appointment
    ? null
    : <ReferralsContainer appointment={appointment} style={referralsStyle} />

const referralsStyle = {
  ...appointmentStyle,
  padding: 12,
  paddingBottom: 0
}
