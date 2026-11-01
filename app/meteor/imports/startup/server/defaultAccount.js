import { Random } from 'meteor/random'
import { Accounts } from 'meteor/accounts-base'
import { Users } from '../../api/users'

export default async () => {
  if (await Users.find({}).countAsync() > 0) { return }

  const defaultAccount = {
    username: 'admin',
    password: Random.id(),
    email: 'admin@example.com'
  }

  console.warn(`[Server] Creating first admin user '${defaultAccount.username}' with password '${defaultAccount.password}'`)
  await Accounts.createUserAsync(defaultAccount)

  await Users.updateAsync({ username: 'admin' }, {
    $set: {
      firstName: 'Admin',
      addedRoles: ['admin']
    }
  })
}
