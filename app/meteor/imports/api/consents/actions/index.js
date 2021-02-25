import { print } from './print'

export const actions = ({ Consents }) => ({
  print: print({ Consents })
})
