import React from 'react'
import { __ } from '../../i18n'
import { InboundCalls } from '../../api/inboundCalls'
import { Box } from '../components/Box'
import { NewInboundCallForm } from './NewInboundCallForm'
import Alert from 'react-s-alert'

export class NewInboundCallContainer extends React.Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (data, dispatch) {
    return new Promise((resolve, reject) => {
      InboundCalls.methods.post.call(data, (err) => {
        if (err) {
          Alert.error(__('inboundCalls.postError'))
          reject(err)
        } else {
          Alert.success(__('inboundCalls.postSuccess'))
          dispatch({ type: 'INBOUND_CALL_POST_SUCCESS' })
          resolve()
        }
      })
    })
  }

  render () {
    return (
      <div className='content'>
        <Box title={__('inboundCalls.thisNew')}>
          <NewInboundCallForm onSubmit={this.handleSubmit} />
        </Box>
      </div>
    )
  }
}
