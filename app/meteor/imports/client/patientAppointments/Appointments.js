import React from 'react'
import { compose, withState, withPropsOnChange } from 'recompose'
import { Icon } from '../components/Icon'
import { green, lighterMutedBackground } from '../layout/styles'
import { Tooltip } from '../components/Tooltip'
import { TagsList } from '../tags/TagsList'
import { __ } from '../../i18n'
import { Filter } from './Filter'
import { twoPlacesIfNeeded } from '../../util/format'

export const Appointments = compose(
  withState('scrollRef', 'setScrollRef'),
  withPropsOnChange(
    ['show'],
    props => window.requestAnimationFrame(() => {
      if (props.scrollRef) {
        props.scrollRef.scrollTop = Number.MAX_SAFE_INTEGER
        window.rr = props.scrollRef
        console.log(props.scrollRef.scrollTop)
      }
    })
  )
)(({
  currentAppointment,
  pastAppointments = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  fullNameWithTitle,
  setScrollRef
}) =>
  <div style={containerStyle}>
    <div style={floatingStyle}>
      <div style={shadowStyle}>
        <Filter />
      </div>
    </div>
    <div ref={setScrollRef} style={appointmentsContainerStyle}> {/* Scroll this to bottom */}
      <div> {/* Inside this div things will not be reversed */}
        {
          pastAppointments.length > 6 &&
            <Oldest />
        }
        {
          pastAppointments.map(id =>
            <Appointment
              key={id}
              hasMedia={(id % 3) === 0}
              fullNameWithTitle={fullNameWithTitle}
            />
          )
        }
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

const Appointment = ({ isCurrent, hasMedia, appointment, fullNameWithTitle }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : appointmentStyle
  }>
    <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} />
    <Tags {...appointment} />
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

const appointmentStyle = {
  borderRadius: 4,
  background: lighterMutedBackground,
  margin: 12
}

const currentAppointmentStyle = {
  ...appointmentStyle,
  background: '#fff',
  marginBottom: 36
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
  paddingRight: 14
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

const Tags = ({ tags }) =>
  <div style={tagsStyle}>
    <TagsList
      tiny
      tags={tags}
    />
  </div>

const tagsStyle = {
  paddingLeft: 10
}

const Note = ({ note }) =>
  <div style={noteStyle}>
    {note || 'Note'}
  </div>

const noteStyle = {
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 15,
  paddingRight: 15
}

const Oldest = () =>
  <div style={oldestStyle}>
    {__('appointments.oldestAppointment')}
  </div>

const oldestStyle = {
  paddingTop: 55,
  marginLeft: dateColumnStyle.width + 12 + 12, // Fake same column as assignee name
  opacity: 0.3
}

const Current = () =>
  <div style={currentStyle}>
    {__('appointments.thisCurrent')}
  </div>

const currentStyle = {
  ...oldestStyle,
  paddingTop: 25
}
