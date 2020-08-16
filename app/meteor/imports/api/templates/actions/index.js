import { lifecycleActions } from '../../../util/meteor/action'

export default function ({ Templates }) {
  return lifecycleActions({
    Collection: Templates,
    plural: 'templates',
    singular: 'template',
    roles: ['admin', 'template-edit']
  })
}
