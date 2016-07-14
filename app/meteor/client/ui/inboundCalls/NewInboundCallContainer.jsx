import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { InboundCalls } from 'api/inboundCalls'
import { Box } from 'client/ui/components/Box'
import { NewInboundCallForm } from './NewInboundCallForm'

const handleSubmit = (data) => {
  console.log('submit', data)
  InboundCalls.methods.post.call(data, (err, res) => {
    console.log('err/res', err, res)
  })
}

export const NewInboundCallContainer = () => (
  <div className="content">
    <Box title={TAPi18n.__('inboundCalls.thisNew')}>
      <NewInboundCallForm onSubmit={handleSubmit} />
    </Box>
  </div>
)
