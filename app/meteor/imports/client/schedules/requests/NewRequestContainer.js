import React from 'react'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { Schedules } from '../../../api/schedules'
import { Box } from '../../components/Box'
import { NewRequestForm } from './NewRequestForm'
import Alert from 'react-s-alert'

export class NewRequestContainer extends React.Component {
  handleSubmit (data, dispatch) {
    return new Promise((resolve, reject) => {
      Schedules.actions.postRequest.call(data, (err) => {
        if (err) {
          Alert.error(__('schedules.postRequestError'))
          reject(err)
          console.log(err)
        } else {
          Alert.success(__('schedules.postRequestSuccess'))
          dispatch({ type: 'SCHEDULES_POST_REQUEST_SUCCESS' })
          resolve()
        }
      })
    })
  }

  render () {
    return (
      <Box
        title={__('schedules.newRequest')}
        type='primary'
        noBorder>
        <NewRequestForm
          onSubmit={this.handleSubmit}
          currentUser={Meteor.user()}
          />
      </Box>
    )
  }
}
