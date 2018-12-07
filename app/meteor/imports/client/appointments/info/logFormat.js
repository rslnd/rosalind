import identity from 'lodash/identity'
import { Users } from '../../../api/users'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'

export const logFormat = {
  move: log => {
    const movedDay = !moment(log.payload.oldStart).isSame(log.payload.newStart, 'day')
    const movedTime = moment(log.payload.oldStart).format('HHmm') !== moment(log.payload.newStart).format('HHmm')
    const movedAssignee = log.payload.oldAssigneeId !== log.payload.newAssigneeId

    if (!(movedDay || movedTime || movedAssignee)) {
      return null
    }

    const getAssigneeName = _id => {
      if (_id) {
        return Users.methods.fullNameWithTitle(Users.findOne({ _id }))
      } else {
        return '(Einschub)'
      }
    }

    return [
      'Verschoben von',
      movedDay && moment(log.payload.oldStart).format(__('time.dateFormatShortNoYear')),
      movedTime && moment(log.payload.oldStart).format(__('time.timeFormat')),
      movedAssignee && getAssigneeName(log.payload.oldAssigneeId),
      '→',
      movedDay && moment(log.payload.newStart).format(__('time.dateFormatShortNoYear')),
      movedTime && moment(log.payload.newStart).format(__('time.timeFormat')),
      movedAssignee && getAssigneeName(log.payload.newAssigneeId),
      'von'
    ].filter(identity).join(' ')
  }
}
