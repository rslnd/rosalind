import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Box } from 'client/ui/components/Box'
import { NewInboundCallForm } from './NewInboundCallForm'

export const NewInboundCallContainer = () => (
  <div className="content">
    <Box title={TAPi18n.__('inboundCalls.thisNew')}>
      <NewInboundCallForm />
    </Box>
  </div>
)
