import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { UserPicker } from '../../users/UserPicker'

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
    const { show, onClose, assignees } = this.props

    const selector = assignees
      ? { _id: { $in: assignees.filter(a => a && a._id).map(a => a._id) } }
      : null

    return <Modal
      enforceFocus={false}
      show={show}
      onHide={onClose}
      bsSize='small'>
      <Modal.Body>
        <UserPicker
          selector={selector}
          autoFocus
          onChange={this.handleChangeAssigneeId}
        />
      </Modal.Body>
      <Modal.Footer>
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
