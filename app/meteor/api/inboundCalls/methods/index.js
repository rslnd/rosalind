import extend from 'lodash/extend'
import resolve from './resolve'
import unresolve from './unresolve'
import { post } from './post'

export default function ({ InboundCalls }) {
  return extend({},
    resolve({ InboundCalls }),
    unresolve({ InboundCalls }),
    { post: post({ InboundCalls }) }
  )
}
