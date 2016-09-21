import extend from 'lodash/extend'
import Time from 'util/time'
import { Users } from 'api/users'
import { Groups } from 'api/groups'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import misc from './misc'
import { upsert } from './upsert'

export default function ({ Schedules }) {
  return extend({},
    isOpen({ Schedules }),
    isScheduled({ Schedules, Users }),
    misc({ Schedules, Users, Groups, Time }),
    { upsert: upsert({ Schedules, Users }) }
  )
}
