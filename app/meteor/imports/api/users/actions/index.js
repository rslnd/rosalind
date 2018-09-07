import { updatePassword } from './updatePassword'
import { updateProfile } from './updateProfile'
import { insert } from './insert'
import { login, logout } from './loginLogout'

export default ({ Users }) => ({
  updatePassword: updatePassword({ Users }),
  updateProfile: updateProfile({ Users }),
  insert: insert({ Users }),
  login: login({ Users }),
  logout: logout({ Users })
})
