import { updateProfile } from './updateProfile'
import { insert } from './insert'

export default ({ Users }) => ({
  updateProfile: updateProfile({ Users }),
  insert: insert({ Users })
})
