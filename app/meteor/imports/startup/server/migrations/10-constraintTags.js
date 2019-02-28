import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Constraints } from '../../../api/constraints'

const hasTags = c => c.tags &&
  c.tags.length >= 1 &&
  c.tags.filter(identity).length >= 1

const up = c => ({ tagId: c })
const down = ({ tagId }) => tagId

Migrations.add({
  version: 10,

  up: function () {
    const constraints = Constraints.find({}, { removed: true }).fetch()

    constraints.filter(hasTags).forEach(c => {
      const tags = c.tags.filter(identity).map(up)
      console.log(c._id, ': ', c.tags, '->', tags, '.')

      if (tags.length === 0) throw new Error('Invalid tag mapping')

      Constraints.update({ _id: c._id }, {
        $set: {
          tags
        }
      })
    })

    return true
  },

  down: function () {
    const constraints = Constraints.find({}, { removed: true }).fetch()

    constraints.filter(hasTags).forEach(c => {
      const tags = c.tags.filter(identity).map(down)
      Constraints.update({ _id: c._id }, {
        $set: {
          tags
        }
      })
    })

    return true
  }
})
