import { Random } from 'meteor/random'
import { Accounts } from 'meteor/accounts-base'
import { Users } from '../../api/users'

export default () => {
  if (Users.find({}).count() > 0) { return }

  const defaultAccount = {
    username: 'admin',
    password: Random.id(),
    email: 'admin@example.com',
    firstName: 'Admin',
    addedRoles: ['admin']
  }

  console.warn(`[Server] Creating first admin user '${defaultAccount.username}' with password '${defaultAccount.password}'`)
  Accounts.createUser(defaultAccount)
}
