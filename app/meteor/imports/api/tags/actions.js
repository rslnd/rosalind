import { lifecycleActions } from '../../util/meteor/action'

export const actions = ({ Tags }) => ({
  ...lifecycleActions({
    Collection: Tags,
    plural: 'tags',
    singular: 'tag',
    roles: ['admin', 'tags-edit']
  })
})
