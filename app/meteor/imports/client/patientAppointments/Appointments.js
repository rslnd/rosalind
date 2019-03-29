import React from 'react'
import { compose, withState, withProps, withHandlers, withPropsOnChange } from 'recompose'
import { Icon } from '../components/Icon'
import { green, lighterMutedBackground } from '../layout/styles'
import { Tooltip } from '../components/Tooltip'
import { TagsList } from '../tags/TagsList'
import { __ } from '../../i18n'
import { Filter } from './Filter'
import { twoPlacesIfNeeded } from '../../util/format'
import { ReferralsContainer } from '../referrals/ReferralsContainer'

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

const AppointmentsList = ({ appointments, fullNameWithTitle }) =>
  appointments.map(a =>
    <Appointment
      key={a._id}
      appointment={a}
      hasMedia={!!a.note}
      fullNameWithTitle={fullNameWithTitle}
    />
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

const Info = ({ appointment, fullNameWithTitle }) =>
  <div style={infoStyle}>
    <span style={flexStyle}>
      <span style={dateColumnStyle}>
        <Icon name='diamond' style={calendarIconStyle} />
        &nbsp;
        <Date {...appointment} />
      </span>
      <Assignee {...appointment} fullNameWithTitle={fullNameWithTitle} />
    </span>

    <span style={flexStyle}>
      <Revenue {...appointment} />
      <Indicator {...appointment} />
    </span>
  </div>

const infoStyle = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  padding: 12,
  paddingTop: 9,
  opacity: 0.9
}

// Fix icon alignmeht with text spans
const infoIconStyle = {
  marginTop: '2.5px'
}

const calendarIconStyle = {
  ...infoIconStyle,
  marginRight: 5
}

const flexStyle = {
  display: 'flex'
}

const dateColumnStyle = {
  display: 'flex',
  width: 240
}

const Date = () =>
  <Tooltip title={'Donnerstag, 30. Jänner 2019 um 18:33 Uhr'}>
    <span>Do., 30. Jänner</span>
  </Tooltip>

const Assignee = ({ assigneeId, fullNameWithTitle }) =>
  <span>{fullNameWithTitle(assigneeId)}</span>

const Revenue = ({ revenue }) =>
  <div style={revenueStyle}>
    {
      (revenue > 0 || revenue === 0) &&
        <>
          <span style={revenueUnitStyle}>€&nbsp;</span>{twoPlacesIfNeeded(revenue)}
        </>
    }
  </div>

const revenueStyle = {
  paddingRight: 14,
  fontWeight: 600
}

const revenueUnitStyle = {
  opacity: 0.8,
  fontSize: '90%'
}

const Indicator = () =>
  <Icon name='check' style={indicatorStyle} />

const indicatorStyle = {
  ...infoIconStyle,
  color: green
}

const Tags = ({ tags, tiny }) =>
  <div style={tagsStyle}>
    <TagsList
      tiny={tiny}
      tags={tags}
    />
  </div>

const tagsStyle = {
  paddingLeft: 10
}

const Note = ({ note }) =>
  <div style={noteStyle} contentEditable>
    {note || 'Note'}
  </div>

const noteStyle = {
  outline: 0,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 15,
  paddingRight: 15
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
