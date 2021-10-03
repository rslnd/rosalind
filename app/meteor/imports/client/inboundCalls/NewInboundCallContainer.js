import React from 'react'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { InboundCalls } from '../../api/inboundCalls'
import { Box } from '../components/Box'
import { NewInboundCallForm, formName } from './NewInboundCallForm'
import Alert from 'react-s-alert'
import { hasRole } from '../../util/meteor/hasRole'
import { PatientsAppointmentsContainer } from '../patientAppointments/PatientsAppointmentsContainer'
import { reset } from 'redux-form'

export class NewInboundCallContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      patientModalId: null
    }

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
          dispatch(reset(formName))
          document.getElementById('filepicker').value = ""
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

        {
          this.state.patientModalId &&
          <PatientsAppointmentsContainer
            show
            patientId={this.state.patientModalId}
            onClose={this.handlePatientModalClose}
          />
        }
      </div>
    )
  }
}
