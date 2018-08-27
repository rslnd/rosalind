import { Clients } from '../'

export const security = () => {
  Clients
    .permit(['update', 'remove'])
    .ifHasRole('admin')
    .allowInClientCode()
}
