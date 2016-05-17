import extend from 'lodash/extend'
import Time from '/imports/util/time'
import { Users } from '/imports/api/users'
import { Groups } from '/imports/api/groups'
import { Appointments } from '/imports/api/appointments'
import { Cache } from '/imports/api/cache'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import misc from './misc'

export default function({ Schedules }) {
  return extend({},
    isOpen({ Schedules }),
    isScheduled({ Schedules, Users }),
    misc({ Schedules, Users, Groups, Time })
  )
}
