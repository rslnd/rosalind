import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'

export default () => {
  Meteor.startup(() => {
    Migrations.migrateTo(1)
  })
}
