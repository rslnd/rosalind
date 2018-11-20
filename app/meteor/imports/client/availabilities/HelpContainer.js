import identity from 'lodash/identity'
import { compose, withState, mapProps, nest, withProps, withHandlers } from 'recompose'
import { Help } from './Help'
import { Availabilities } from '../../api/availabilities'
import { Constraints } from '../../api/constraints'
import { Users } from '../../api/users'
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { withTracker } from '../components/withTracker'
import { prepareAvailabilities, applySearchFilter, toResults } from './filter'
import { withDrawer, Drawer } from './Drawer'

const composer = props => {
  const availabilities = Availabilities.find({}, { sort: { start: 1 } }).fetch()
  const tags = Tags.find({}).fetch()
  const constraints = Constraints.find({}).fetch()
  const assignees = Users.find({
    removed: { $ne: true },
    employee: true
  }).fetch().map(u => ({
    ...u,
    fullNameWithTitle: Users.methods.fullNameWithTitle(u)
  }))
  const calendars = Calendars.find({}).fetch()

  return {
    ...props,
    availabilities,
    tags,
    constraints,
    assignees,
    calendars
  }
}

const handleSearchValueChange = props => (value, { action }) => {
  if (action === 'input-change') {
    props.setSearchValue(value)
  }
}

const log = pre => withProps(p => console.log(pre, p))

export const HelpContainer = compose(
  withTracker(composer),
  withProps(prepareAvailabilities),
  withState('searchValue', 'setSearchValue', ''),
  withHandlers({ handleSearchValueChange }),
  withProps(applySearchFilter),
  withDrawer,
  // withProps(explodeConstraints),
  // log('exploded'),
  // withProps(combineConstraints),
  // log('combined')
)(Help)
