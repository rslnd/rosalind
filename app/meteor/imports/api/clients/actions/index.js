import { register } from './register'

export const actions = ({ Clients }) => ({
  register: register({ Clients })
})
