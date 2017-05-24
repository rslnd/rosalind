import fromPairs from 'lodash/fromPairs'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'
import { renderEmail as doRenderEmail } from '../methods/renderEmail'

export const renderEmail = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/renderEmail',

    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    run ({ report }) {
      const userIdToNameMapping = fromPairs(Users.find({}).map(u => [u._id, u.fullNameWithTitle()]))

      const mapAssigneeType = type => TAPi18n.__(`reports.assigneeType__${type}`, null, 'de-AT')
      const mapUserIdToName = userId => userIdToNameMapping[userId]

      const { title, text } = doRenderEmail({ report, mapUserIdToName, mapAssigneeType })

      return { title, text }
    }
  })
}
