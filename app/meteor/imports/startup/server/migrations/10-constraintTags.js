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

  up: async function () {
    const constraints = await Constraints.find({}, { removed: true }).fetchAsync()

    for (const c of constraints.filter(hasTags)) {
      const tags = c.tags.filter(identity).map(up)
      console.log(c._id, ': ', c.tags, '->', tags, '.')

      if (tags.length === 0) throw new Error('Invalid tag mapping')

      await Constraints.updateAsync({ _id: c._id }, {
        $set: {
          tags
        }
      })
    }

    return true
  },

  down: async function () {
    const constraints = await Constraints.find({}, { removed: true }).fetchAsync()

    for (const c of constraints.filter(hasTags)) {
      const tags = c.tags.filter(identity).map(down)
      await Constraints.updateAsync({ _id: c._id }, {
        $set: {
          tags
        }
      })
    }

    return true
  }
})
