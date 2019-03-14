import React from 'react'
import { Icon } from '../components/Icon'
import { green, gray } from '../layout/styles'

export const Appointments = () =>
  <div style={containerStyle}>
    <div style={appointmentsContainerStyle}>
      <Filter />
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

const Filter = () =>
  <div style={filterStyle}>
    Alle Termine (36) <Icon name='caret-down' />
  </div>

const filterStyle = {
  display: 'absolute',
  top: 0,
  right: 20,
  width: 150,
  height: 28,
  padding: 6
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
  background: '#ddd',
  height: 120,
  margin: 6
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
  padding: 4
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
