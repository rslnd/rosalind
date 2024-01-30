import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { __ } from '../../../../i18n'
import { Icon } from '../../../components/Icon'
import { Schedules, Users } from '../../../../api'
import { withTracker } from '../../../components/withTracker'
import moment from 'moment-timezone'
import { fullNameWithTitle } from '../../../../api/users/methods'
import { durationFormat } from '../../../reports/shared/durationFormat'


export const ScheduleModalInner = ({ scheduleId, user, schedule, show, onClose, onClickScheduleSoftRemove }) => (
  <Modal
    enforceFocus={false}
    show={show}
    onHide={onClose}
    bsSize='large'>
    <Modal.Body>

      {
        scheduleId && schedule && (
          <table className='table enable-select'>
            <tbody>
              <tr><td>Datum</td><td>{moment(schedule.start).format(__('time.dateFormat'))}</td></tr>
              <tr><td>Blockiert von</td><td>{moment(schedule.start).format(__('time.timeFormatShort'))} (inkl.)</td></tr>
              <tr><td>Blockiert bis</td><td>{moment(schedule.end).format(__('time.timeFormatShort'))} (exkl.) </td></tr>
              <tr><td>Dauer</td><td>{durationFormat(schedule.end - schedule.start, 'ms')} h</td></tr>
              <tr><td>Erstellt von</td><td>{user ? fullNameWithTitle(user) : <i>System</i>}</td></tr>
              <tr><td>Erstellt am</td><td>{moment(schedule.createdAt).format(__('time.dateTime'))}</td></tr>
              <tr className="text-muted"><td>ID</td><td>{schedule._id}</td></tr>
            </tbody>
          </table>
        )
      }

      {/* {schedule && JSON.stringify(Object.keys(schedule))} */}

      <Button fullWidth type='danger' onClick={onClickScheduleSoftRemove}>
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

const composer = (props) => {
  if (props.scheduleId) {
    const schedule = Schedules.findOne({ _id: props.scheduleId })
    const user = schedule && Users.findOne({ _id: schedule.createdBy })
    return { schedule, user, ...props }
  } else {
    return props
  }
}

export const ScheduleModal = withTracker(composer)(ScheduleModalInner)
