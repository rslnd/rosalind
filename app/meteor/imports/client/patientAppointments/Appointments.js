import React from 'react'
import { Icon } from '../components/Icon'
import { green, lighterMutedBackground, darkerMutedBackground } from '../layout/styles'

export const Appointments = () =>
  <div style={containerStyle}>
    <div style={floatingStyle}>
      <div style={shadowStyle}>
        <Filter />
      </div>
    </div>
    <div style={appointmentsContainerStyle}>
      <div> {/* Inside this div things will not be reversed */}
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(id =>
            <Appointment key={id} isSelected={id === 9} />
          )
        }
      </div>
    </div>
  </div>

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}

const floatingStyle = {
  position: 'absolute',
  width: '70%',
  top: 0,
  zIndex: 3,
  height: 28,
  paddingLeft: 10,
  paddingRight: 10
}

const shadowStyle = {
  position: 'relative',
  width: '100%',
  height: 25,
  background: `linear-gradient(to bottom, ${darkerMutedBackground} 0%, rgba(0,0,0,0) 100%)`,
  pointerEvents: 'none'
}

const Filter = () =>
  <div style={filterTabStyle}>
    <div style={filterStyle}>
      Alle Termine (36) <Icon name='caret-down' />
    </div>
  </div>

const filterTabStyle = {
  position: 'absolute',
  // right: 39,
  left: 120,
  top: 0,
  opacity: 0.9,
  background: '#eef1f5',
  borderRadius: '0 0 5px 5px',
  border: '1px solid #a5b0c44a'
}

const filterStyle = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 6,
  paddingBottom: 6,
  fontSize: '90%',
  opacity: 0.9
}

const Appointment = ({ isSelected }) =>
  <div style={isSelected ? selectedAppointmentStyle : appointmentStyle}>
    <Info />
    <Tags />
    <Note />
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
  height: 120,
  margin: 12
}

const selectedAppointmentStyle = {
  ...appointmentStyle,
  background: '#fff'
}

const Info = () =>
  <div style={infoStyle}>
    <span style={dateNameColumnStyle}>
      <span style={dateColumnStyle}>
        <Icon name='diamond' />
        &nbsp;
        <Date />
      </span>
      <Assignee />
    </span>

    <Indicator />
  </div>

const infoStyle = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  padding: 12
}

const dateNameColumnStyle = {
  display: 'flex'
}

const dateColumnStyle = {
  display: 'flex',
  width: 260
}

const Date = () =>
  <span>30. Jänner</span>

const Assignee = () =>
  <span>Dr. Jörg Prettenhofer</span>

const Indicator = () =>
  <Icon name='check' style={indicatorStyle} />

const indicatorStyle = {
  color: green
}

const Tags = () =>
  <div>Tags</div>

const Note = () =>
  <div>Note </div>
