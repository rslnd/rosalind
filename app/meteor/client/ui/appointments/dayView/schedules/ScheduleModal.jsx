import { Modal } from 'react-bootstrap'
import FlatButton from 'material-ui/FlatButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'

export const ScheduleModal = ({ show, onClose, onClickScheduleSoftRemove }) => (
  <Modal
    enforceFocus={false}
    show={show}
    onHide={onClose}
    bsSize="large">
    <Modal.Body>
      <FlatButton
        onClick={onClickScheduleSoftRemove}
        label={<span>
          <Icon name="trash-o" />&emsp;
          {TAPi18n.__('schedules.softRemove')}
        </span>} />
    </Modal.Body>
    <Modal.Footer>
      <div className="pull-right">
        <FlatButton
          onClick={onClose}
          label={TAPi18n.__('ui.close')} />
      </div>
    </Modal.Footer>
  </Modal>
)
