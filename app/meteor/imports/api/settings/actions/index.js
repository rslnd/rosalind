import { set } from './set'
import { lifecycleActions } from '../../../util/meteor/action'

export default function ({ Settings }) {
  return {
    set: set({ Settings }),
    ...lifecycleActions({
      Collection: Settings,
      plural: 'settings',
      singular: 'setting',
      roles: ['admin'],
      actions: ['insert', 'update', 'hardRemove']
    })
  }
}
