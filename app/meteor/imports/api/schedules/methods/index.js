import extend from 'lodash/extend'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import misc from './misc'

export default function(collection) {
  isOpenMethods = isOpen(collection)
  isScheduledMethods = isScheduled(collection)
  miscMethods = misc(collection)

  return extend({},
    isOpen(collection),
    isScheduled(collection),
    misc(collection)
  )
}
