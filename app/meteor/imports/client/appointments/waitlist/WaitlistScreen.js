import React from 'react'
import { WaitlistItem } from './WaitlistItem'
import FlipMove from 'react-flip-move'
import { Modal } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import Button from 'material-ui/Button'
import { UserPickerContainer } from '../../users/UserPickerContainer'

export class WaitlistScreen extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      changingAssignee: false
    }

    this.handleStartChangeWaitlistAssignee = this.handleStartChangeWaitlistAssignee.bind(this)
    this.handleFinishChangeWaitlistAssignee = this.handleFinishChangeWaitlistAssignee.bind(this)
  }

  handleStartChangeWaitlistAssignee ({ appointmentId }) {
    this.setState({
      changingAssignee: true,
      changingAssigneeAppointmentId: appointmentId,
      changingAssigneeNewId: null
    })
  }

  handleFinishChangeWaitlistAssignee () {
    this.props.action(
      'changeWaitlistAssignee',
      this.state.changingAssigneeAppointmentId,
      {},
      {
        waitlistAssigneeId: this.state.changingAssigneeNewId
      }
    ).fn()

    this.setState({
      changingAssignee: false,
      changingAssigneeAppointmentId: null,
      changingAssigneeNewId: null
    })
  }

  render () {
    const {
      appointments,
      action,
      canViewAllWaitlists,
      handleChangeAssigneeView,
      handleChangeWaitlistAssignee,
      canChangeWaitlistAssignee
    } = this.props

    return (
      <div className='content'>
        {
          canViewAllWaitlists &&
            <div className='hide-print' style={{ paddingBottom: 15 }}>
              <UserPickerContainer
                autoFocus
                onChange={handleChangeAssigneeView} />
            </div>

        }
        <FlipMove style={containerStyle}>
          {
            appointments.map((appointment, i) => (
              <div key={appointment._id}>
                <WaitlistItem
                  isFirst={i === 0}
                  isLast={i === (appointments.length - 1)}
                  appointment={appointment}
                  action={action}
                  handleChangeWaitlistAssignee={this.handleStartChangeWaitlistAssignee}
                  canChangeWaitlistAssignee={canChangeWaitlistAssignee}
                />
              </div>
            ))
          }
        </FlipMove>

        <Modal
          enforceFocus={false}
          show={!!this.state.changingAssignee}
          bsSize='small'>
          <Modal.Body>
            <UserPickerContainer
              autoFocus
              onChange={newAssigneeId =>
                this.setState({
                  changingAssigneeNewId: newAssigneeId
                })
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <div className='pull-left'>
              <Button onClick={() => this.setState({ changingAssignee: false })}>
                {TAPi18n.__('ui.close')}
              </Button>
            </div>
            <div className='pull-right'>
              <Button color='primary' onClick={this.handleFinishChangeWaitlistAssignee}>
                {TAPi18n.__('ui.ok')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

      </div>
    )
  }
}

const containerStyle = {
  padding: 12,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 100px)'
}
