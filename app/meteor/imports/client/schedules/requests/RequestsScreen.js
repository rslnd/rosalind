import React from 'react'
import FlipMove from 'react-flip-move'
import { RequestItem } from './RequestItem'
import { NewRequestContainer } from './NewRequestContainer'

export const RequestsScreen = ({ requests, approve, decline, canEdit }) => (
  <div className='content'>
    <div className='row'>
      <FlipMove>
        <div key='newRequest' className='col-md-6'>
          <NewRequestContainer />
        </div>
        {requests.map((request) => (
          <div key={request._id} className='col-md-6'>
            <RequestItem request={request} approve={approve} decline={decline} canEdit={canEdit} />
          </div>
        ))}
      </FlipMove>
    </div>
  </div>
)
