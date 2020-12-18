import { setPasswordless } from './setPasswordless'
import { unsetPassword } from './unsetPassword'
import { updatePassword } from './updatePassword'
import { updateProfile } from './updateProfile'
import { updateRoles } from './updateRoles'
import { insert } from './insert'
import { login, logout } from './loginLogout'
import { remove } from './remove'
import { restore } from './restore'
import { updateAllowedClientIds } from './updateAllowedClientIds'

export default ({ Users }) => ({
  setPasswordless: setPasswordless({ Users }),
  unsetPassword: unsetPassword({ Users }),
  updatePassword: updatePassword({ Users }),
  updateProfile: updateProfile({ Users }),
  updateRoles: updateRoles({ Users }),
  insert: insert({ Users }),
  login: login({ Users }),
  logout: logout({ Users }),
  remove: remove({ Users }),
  restore: restore({ Users }),
  updateAllowedClientIds: updateAllowedClientIds({ Users })
})
