import React from 'react'
import FlipMove from 'react-flip-move'
import { TAPi18n } from 'meteor/tap:i18n'
import { RequestItem } from './RequestItem'
import { NewRequestContainer } from './NewRequestContainer'
import { Box } from 'client/ui/components/Box'

export const RequestsScreen = ({ requests, approve, decline, canEdit }) => (
  <div className="content">
    <div className="row">
      <FlipMove>
        <div key="newRequest" className="col-md-6">
          <NewRequestContainer />
        </div>
        {requests.map((request) => (
          <div key={request._id} className="col-md-6">
            <RequestItem request={request} approve={approve} decline={decline} canEdit={canEdit} />
          </div>
        ))}
      </FlipMove>
    </div>
  </div>
)
