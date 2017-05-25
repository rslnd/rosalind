import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { process as server } from 'meteor/clinical:env'

export default () => (
  Roles.userIsInRole(Meteor.userId(), ['admin'], Roles.GLOBAL_GROUP)
  ? (
    <div className="content">
      <pre>{JSON.stringify(server.env, null, 2)}</pre>
    </div>
  ) : (
    <div className="content">
      <pre>No admin privileges.</pre>
    </div>
  )
)
