import React from 'react'
import { Modal } from 'react-bootstrap'
import Button from 'material-ui/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../../components/Icon'

export const ScheduleModal = ({ show, onClose, onClickScheduleSoftRemove }) => (
  <Modal
    enforceFocus={false}
    show={show}
    onHide={onClose}
    bsSize='large'>
    <Modal.Body>
      <Button
        onClick={onClickScheduleSoftRemove}
        label={<span>
          <Icon name='trash-o' />&emsp;
          {TAPi18n.__('schedules.softRemove')}
        </span>} />
    </Modal.Body>
    <Modal.Footer>
      <div className='pull-right'>
        <Button
          onClick={onClose}
          label={TAPi18n.__('ui.close')} />
      </div>
    </Modal.Footer>
  </Modal>
)
