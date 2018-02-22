import React from 'react'
import { WaitlistItem } from './WaitlistItem'
import FlipMove from 'react-flip-move'

export const WaitlistScreen = ({ appointments, action }) => (
  <FlipMove style={containerStyle}>
    {
      appointments.map((appointment, i) => (
        <div key={appointment._id}>
          <WaitlistItem
            isFirst={i === 0}
            isLast={i === (appointments.length - 1)}
            appointment={appointment}
            action={action}
          />
        </div>
      ))
    }
  </FlipMove>
)

const containerStyle = {
  padding: 12,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 100px)'
}
