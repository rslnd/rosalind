import { publish } from '../../../util/meteor/publish'

export const publication = ({ Media }) => {
  publish({
    name: 'media',
    roles: ['media'],
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      return Media.find({}) // TODO: Scope properly
    }
  })
}
