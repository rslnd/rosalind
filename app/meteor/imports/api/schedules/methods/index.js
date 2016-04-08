import extend from 'lodash/extend'
import cache from './cache'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import misc from './misc'

export default function(collection) {
  return extend({},
    cache(collection),
    isOpen(collection),
    isScheduled(collection),
    misc(collection)
  )
}
