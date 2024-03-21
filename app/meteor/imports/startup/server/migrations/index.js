import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import './1-topLevelProfile'
import './2-topLevelProfile'
import './3-createdAt'
import './4-referredToCosmetics'
import './5-referredToAlternative'
import './6-reportDate'
import './7-schedulesToConstraints'
import './8-agreements'
import './9-overridesToAvailabilities'
import './10-constraintTags'
import './11-referrables'
import './12-appointmentsCommentsToNote'
import './13-patientSince'
import './14-fixAppointmentsComments'
import './15-canceledBySMS'
import './16-messagePatientAppointmentIds'
import './17-messageCalendarId'
import './18-normalizeName'

export default () => {
  Meteor.startup(() => {
    Migrations.config({
      logIfLatest: false
    })

    Migrations.migrateTo('latest')
  })
}
