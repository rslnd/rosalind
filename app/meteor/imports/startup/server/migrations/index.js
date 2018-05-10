import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import './1-topLevelProfile'
import './2-topLevelProfile'
import './3-createdAt'
import './4-referredToCosmetics'
import './5-referredToAlternative'

export default () => {
  Meteor.startup(() => {
    Migrations.config({
      logIfLatest: false
    })

    Migrations.migrateTo('latest')
  })
}
