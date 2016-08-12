import { renderEmail } from './renderEmail'

export default function ({ Reports }) {
  return Object.assign({},
    { renderEmail: renderEmail({ Reports }) }
  )
}
