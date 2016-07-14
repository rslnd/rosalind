import { resolve } from './resolve'
import { unresolve } from './unresolve'
import { post } from './post'

export default function ({ InboundCalls }) {
  return Object.assign({},
    { resolve: resolve({ InboundCalls }) },
    { unresolve: unresolve({ InboundCalls }) },
    { post: post({ InboundCalls }) }
  )
}
