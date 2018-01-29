import React from 'react'

const WaitlistItem = ({ appointment }) =>
  <div>{appointment.start.toString()}</div>

export const WaitlistScreen = ({ appointments }) => (
  <div>
    {
      appointments.map(appointment => (
        <WaitlistItem key={appointment._id} appointment={appointment} />
      ))
    }
  </div>
)
