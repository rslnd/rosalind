import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { __ } from '../../../../i18n'
import { Icon } from '../../../components/Icon'

export const ScheduleModal = ({ show, onClose, onClickScheduleSoftRemove }) => (
  <Modal
    enforceFocus={false}
    show={show}
    onHide={onClose}
    bsSize='large'>
    <Modal.Body>
      <Button onClick={onClickScheduleSoftRemove}>
        <span>
          <Icon name='trash-o' />&emsp;
          {__('schedules.softRemove')}
        </span>
      </Button>
    </Modal.Body>
    <Modal.Footer>
      <div className='pull-right'>
        <Button onClick={onClose}>
          {__('ui.close')}
        </Button>
      </div>
    </Modal.Footer>
  </Modal>
)
