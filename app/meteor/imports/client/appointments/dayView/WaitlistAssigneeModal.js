import React from 'react'
import { Modal } from 'react-bootstrap'
import Button from 'material-ui/Button'
import { __ } from '../../../i18n'
import { UserPickerContainer } from '../../users/UserPickerContainer'

export class WaitlistAssigneeModal extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      selectedAssigneeId: null
    }

    this.handleChangeAssigneeId = this.handleChangeAssigneeId.bind(this)
    this.handleFinishClick = this.handleFinishClick.bind(this)
  }

  handleChangeAssigneeId (selectedAssigneeId) {
    this.setState({
      selectedAssigneeId
    })
  }

  handleFinishClick () {
    this.props.onSetAdmitted({
      appointmentId: this.props.appointmentId,
      waitlistAssigneeId: this.state.selectedAssigneeId
    })

    this.props.onClose()
  }

  render () {
    const { show, onClose } = this.props
    return <Modal
      enforceFocus={false}
      show={show}
      onHide={onClose}
      bsSize='small'>
      <Modal.Body>

        <UserPickerContainer
          autoFocus
          onChange={this.handleChangeAssigneeId}
        />

      </Modal.Body>
      <Modal.Footer>
        <div className='pull-left'>
          <Button onClick={onClose}>
            {__('ui.close')}
          </Button>
        </div>
        <div className='pull-right'>
          <Button
            color='primary'
            onClick={this.handleFinishClick}
            disabled={!this.state.selectedAssigneeId}>
            {__('ui.ok')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  }
}
