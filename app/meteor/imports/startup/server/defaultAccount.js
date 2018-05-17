import { Random } from 'meteor/random'
import { Accounts } from 'meteor/accounts-base'
import { Users } from '../../api/users'
import { Roles } from 'meteor/alanning:roles'

export default () => {
  if (process.env.NODE_ENV === 'production') { return }
  if (Users.find({}).count() > 0) { return }

  const defaultAccount = {
    username: 'admin',
    password: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin'
  }

  console.warn(`[Server] Creating first user '${defaultAccount.username}' with password '${defaultAccount.password}'`)
  const id = Accounts.createUser(defaultAccount)
  Roles.addUsersToRoles(id, ['admin'], Roles.GLOBAL_GROUP)
}
