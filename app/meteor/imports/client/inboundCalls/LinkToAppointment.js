import React from 'react'
import { AppointmentModal } from '../appointments/info/AppointmentModal'

export const LinkToAppointment = ({ text, linkText, onClick }) => (
  text &&
    <div className='row'>
      <span className='text-muted col-md-12'>
        {
          linkText
            ? (
              <span>
                {text}<br />
                <a onClick={onClick}>{linkText}</a>
              </span>
            ) : text
        }
      </span>
      <br />
    </div> || null
)

export class LinkToAppointmentWrapper extends React.Component {
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
            <AppointmentModal
              show={this.state.modalOpen}
              onClose={this.handleModalClose}
              appointmentId={this.props.appointmentId}
              viewInCalendar
            />
        }
      </div>
    )
  }
}
