import { resolve } from './resolve'
import { unresolve } from './unresolve'
import { post } from './post'
import { edit } from './edit'

export default function ({ InboundCalls }) {
  return Object.assign({},
    { resolve: resolve({ InboundCalls }) },
    { unresolve: unresolve({ InboundCalls }) },
    { post: post({ InboundCalls }) },
    { edit: edit({ InboundCalls }) }
  )
}
