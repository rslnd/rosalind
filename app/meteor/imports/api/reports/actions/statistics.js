import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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

    async run ({ asOf, accessToken } = {}) {
      try {
        if (this.isSimulation) { return }
        await assertReportsAccess({ userId: this.userId, connection: this.connection, accessToken })
        return await computeStatistics({ Appointments, Schedules, Calendars, Users, Constraints, Tags, asOf })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
