import React from 'react'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { InboundCalls } from '../../api/inboundCalls'
import { Box } from '../components/Box'
import { NewInboundCallForm } from './NewInboundCallForm'
import Alert from 'react-s-alert'
import { hasRole } from '../../util/meteor/hasRole'

export class NewInboundCallContainer extends React.Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (data, dispatch) {
    // Transform boolean into current userId
    data.pinnedBy = data.pinnedBy ? Meteor.userId() : undefined

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
        <Box>
          <NewInboundCallForm
            onSubmit={this.handleSubmit}
            canPin={hasRole(Meteor.userId(), ['admin', 'inboundCalls-pin'])} />
        </Box>
      </div>
    )
  }
}
