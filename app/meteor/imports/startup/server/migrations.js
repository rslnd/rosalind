import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'

export default () => {
  Meteor.startup(() => {
    Migrations.config({
      logIfLatest: false
    })

    Migrations.migrateTo('latest')
  })
}
