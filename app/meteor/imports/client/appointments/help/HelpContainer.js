import identity from 'lodash/identity'
import { compose, withState, mapProps, withProps, withHandlers } from 'recompose'
import { Help } from './Help'
import { Constraints } from '../../../api/constraints'
import { Users } from '../../../api/users'
import { Tags } from '../../../api/tags'
import { withTracker } from '../../components/withTracker'
import { applySearchFilter } from './filter'

const composer = props => {
  const constraints = Constraints.find({}).fetch().map(c => {
    const assignees = c.assigneeIds
      ? c.assigneeIds.map(_id => {
        const user = Users.findOne({ _id }, { removed: true })
        if (user) {
          return {
            ...user,
            fullNameWithTitle: Users.methods.fullNameWithTitle(user)
          }
        }
      }).filter(identity)
      : []
    const tags = c.tags ? c.tags.map(_id => Tags.findOne({ _id })) : []

    return {
      ...c,
      assignees,
      tags
    }
  })

  return {
    ...props,
    constraints
  }
}

const handleSearchValueChange = props => value => {
  if (!value || typeof value !== 'string') {
    props.setSearchValue('')
  } else {
    props.setSearchValue(value)
  }
}

export const HelpContainer = compose(
  withState('isOpen', 'setOpen', false),
  withState('searchValue', 'setSearchValue', ''),
  withHandlers({ handleSearchValueChange }),
  withTracker(composer),
  mapProps(applySearchFilter)
)(Help)
