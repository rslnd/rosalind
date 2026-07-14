import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { computeStatistics } from '../methods/computeStatistics'
import { assertReportsAccess } from '../methods/assertReportsAccess'

export const statistics = ({ Reports, Appointments, Schedules, Calendars, Users, Constraints, Tags }) => {
  return new ValidatedMethod({
    name: 'reports/statistics',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      asOf: { type: Date, optional: true },
      accessToken: { type: String, optional: true }
    }).validator(),

    run ({ asOf, accessToken } = {}) {
      try {
        if (this.isSimulation) { return }
        assertReportsAccess({ userId: this.userId, connection: this.connection, accessToken })
        return computeStatistics({ Appointments, Schedules, Calendars, Users, Constraints, Tags, asOf })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
