import React from 'react'
import { WaitlistItem } from './WaitlistItem'
import FlipMove from 'react-flip-move'
import { UserPickerContainer } from '../../users/UserPickerContainer'

export const WaitlistScreen = ({ appointments, action, canViewAllWaitlists, handleChangeAssigneeView }) => (
  <div className='content'>
    {
      canViewAllWaitlists &&
        <div className='hide-print' style={{ paddingBottom: 15 }}>
          <UserPickerContainer
            autoFocus
            onChange={handleChangeAssigneeView} />
        </div>

    }
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
  </div>
)

const containerStyle = {
  padding: 12,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 100px)'
}
