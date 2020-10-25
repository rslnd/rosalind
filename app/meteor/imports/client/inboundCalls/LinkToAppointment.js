import React from 'react'
import { PatientsAppointmentsContainer } from '../patientAppointments/PatientsAppointmentsContainer'

export const LinkToAppointment = ({ text, linkText, onClick }) => (
  ((text || linkText) &&
    <div className='row'>
      <span className='text-muted col-md-12'>
        {
          linkText
            ? (
              <span>
                {text} {text && <br />}
                <a onClick={onClick}>{linkText}</a>
              </span>
            ) : text
        }
      </span>
      <br />
    </div>
  ) || null
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
    const {
      patientId,
      appointmentId,
      children
    } = this.props

    return (
      <>
        {
          (children && (appointmentId || patientId))
            ? children({ onClick: this.handleModalOpen })
            : <LinkToAppointment {...this.props} onClick={this.handleModalOpen} />
        }
        {
          this.state.modalOpen && (appointmentId || patientId) &&
            <PatientsAppointmentsContainer
              show={this.state.modalOpen}
              onClose={this.handleModalClose}
              appointmentId={appointmentId}
              patientId={patientId}
              viewInCalendar
            />
        }
      </>
    )
  }
}
