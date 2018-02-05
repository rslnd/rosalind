import React from 'react'
import FlipMove from 'react-flip-move'
import namecase from 'namecase'
import { Box } from '../../components/Box'

export const WaitlistScreen = ({ appointments }) => (
  <FlipMove style={containerStyle}>
    {
      appointments.map(appointment => (
        <div key={appointment._id}>
          <WaitlistItem appointment={appointment} />
        </div>
      ))
    }
  </FlipMove>
)

const containerStyle = {
  padding: 6,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 100px)'
}

const boxStyle = {
  fontSize: 18,
  padding: 6,
  marginBottom: 10
}

const WaitlistItem = ({ appointment }) =>
  <Box noPadding boxStyle={boxStyle}>
    <span className='text-muted'>
      {appointment.patient.prefix()}
      {
        appointment.patient.profile.titlePrepend &&
          <span>
            {appointment.patient.profile.titlePrepend}
            &ensp;
          </span>
      }
    </span>
    <b>{namecase(appointment.patient.profile.lastName)}</b>&ensp;
    {namecase(appointment.patient.profile.firstName)}&ensp;
    <span className='text-muted'>
      {appointment.patient.profile.titleAppend}
    </span>
  </Box>
