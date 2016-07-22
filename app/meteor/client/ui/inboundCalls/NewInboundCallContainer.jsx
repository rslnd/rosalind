import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { InboundCalls } from 'api/inboundCalls'
import { Box } from 'client/ui/components/Box'
import { NewInboundCallForm } from './NewInboundCallForm'
import { sAlert } from 'meteor/juliancwirko:s-alert'

export class NewInboundCallContainer extends React.Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (data, dispatch) {
    return new Promise((resolve, reject) => {
      InboundCalls.methods.post.call(data, (err) => {
        if (err) {
          sAlert.error(TAPi18n.__('inboundCalls.postError'))
          reject(err)
        } else {
          sAlert.success(TAPi18n.__('inboundCalls.postSuccess'))
          dispatch({ type: 'INBOUND_CALL_POST_SUCCESS' })
          resolve()
        }
      })
    })
  }

  render () {
    return (
      <div className="content">
        <Box title={TAPi18n.__('inboundCalls.thisNew')}>
          <NewInboundCallForm onSubmit={this.handleSubmit} />
        </Box>
      </div>
    )
  }
}
