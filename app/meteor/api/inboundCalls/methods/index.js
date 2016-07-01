import extend from 'lodash/extend'
import resolve from './resolve'
import unresolve from './unresolve'

export default function ({ InboundCalls }) {
  return extend({},
    resolve({ InboundCalls }),
    unresolve({ InboundCalls })
  )
}
