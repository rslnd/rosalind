import { resolve } from './resolve'
import { unresolve } from './unresolve'
import { post } from './post'
import { postContactForm } from './postContactForm'
import { edit } from './edit'
import { auerPhone } from './auerPhone'

export default function ({ InboundCalls, InboundCallsTopics }) {
  return Object.assign({},
    { resolve: resolve({ InboundCalls }) },
    { unresolve: unresolve({ InboundCalls }) },
    { post: post({ InboundCalls }) },
    { postContactForm: postContactForm({ InboundCalls, InboundCallsTopics }) },
    { edit: edit({ InboundCalls }) },
    { auerPhone: auerPhone({ InboundCalls }) }
  )
}
