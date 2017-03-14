import React from 'react'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointments } from 'api/appointments'
import { Users } from 'api/users'
import { LinkToAppointment } from './LinkToAppointment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { AppointmentInfoModal } from 'client/ui/appointments/info/AppointmentInfoModal'

const getFormattedAppointmentData = (appointmentId) => {
  if (!appointmentId) { return {} }
  Meteor.subscribe('appointment', appointmentId)
  const appointment = Appointments.findOne({ _id: appointmentId })
  if (appointment) {
    const start = moment(appointment.start)
    const date = start.format(TAPi18n.__('time.dateFormatWeekdayShort'))
    const time = start.format(TAPi18n.__('time.timeFormat'))

    if (appointment.assigneeId) {
      const assignee = Users.findOne({ _id: appointmentId })
      const assigneeName = assignee && assignee.lastNameWithTitle()
      return { date, time, assigneeName }
    } else {
      return { date, time }
    }
  } else {
    return {}
  }
}

const composer = ({ inboundCall }, onData) => {
  if (!(inboundCall && inboundCall.payload)) {
    return onData(null, {})
  }

  if (inboundCall.payload.channel !== 'SMS') {
    return onData(null, {})
  }

  const appointmentId = inboundCall.payload.appointmentId

  const { date, time, assigneeName } = getFormattedAppointmentData(appointmentId)

  if (!date) {
    return onData(null, { text: TAPi18n.__('inboundCalls.isSmsFromPatient') })
  }

  if (date && !assigneeName) {
    return onData(null, {
      text: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkText', { date, time }),
      appointmentId
    })
  }

  if (date && assigneeName) {
    return onData(null, {
      text: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkTextWithAssigneeName', { date, time, assigneeName }),
      appointmentId
    })
  }

  onData(null, {})
}

class LinkToAppointmentWrapper extends React.Component {
  constructor (props) {
    super(props)
    this.state = { modalOpen: false }
    this.handleModalOpen = this.handleModalOpen.bind(this)
    this.handleModalClose = this.handleModalClose.bind(this)
  }

  handleModalOpen () {
    this.setState({
      modalOpen: true
    })
  }

  handleModalClose () {
    this.setState({
      modalOpen: false
    })
  }

  render () {
    return (
      <div>
        <LinkToAppointment {...this.props} onClick={this.handleModalOpen} />
        {
          this.props.appointmentId &&
            <AppointmentInfoModal
              show={this.state.modalOpen}
              onClose={this.handleModalClose}
              appointmentId={this.props.appointmentId}
            />
        }
      </div>
    )
  }
}

export const LinkToAppointmentContainer = composeWithTracker(composer)(LinkToAppointmentWrapper)
