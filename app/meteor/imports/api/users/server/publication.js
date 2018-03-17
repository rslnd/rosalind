import { Users } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'users',
    preload: true,
    fn: function () {
      return Users.find({}, {
        fields: {
          username: 1,
          groupId: 1,
          firstName: 1,
          lastName: 1,
          titlePrepend: 1,
          titleAppend: 1,
          gender: 1,
          birthday: 1,
          group: 1,
          employee: 1,
          roles: 1,
          settings: 1,
          external: 1
        }
      })
    }
  })
}
