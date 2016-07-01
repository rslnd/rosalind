import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { InboundCallItem } from './InboundCallItem'
import { Box } from 'client/ui/components/Box'

export const InboundCallsScreen = ({ inboundCalls, resolve, unresolve }) => {
  if (inboundCalls.length === 0) {
    return (
      <div className="content">
        <Box type="success" title={TAPi18n.__('ui.allDone')} body={TAPi18n.__('inboundCalls.empty')} />
      </div>
    )
  } else {
    return (
      <div className="content">
        <div className="row">
          {inboundCalls.map((inboundCall) => (
            <div key={inboundCall._id} className="col-md-6">
              <InboundCallItem inboundCall={inboundCall} resolve={resolve} unresolve={unresolve} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}
