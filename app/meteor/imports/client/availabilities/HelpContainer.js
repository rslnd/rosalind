import React from 'react'
import idx from 'idx'
import { compose, withState, withProps, withHandlers } from 'recompose'
import { Help } from './Help'
import { Availabilities } from '../../api/availabilities'
import { Constraints } from '../../api/constraints'
import { Users } from '../../api/users'
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { withTracker } from '../components/withTracker'
import { prepareAvailabilities, applySearchFilter } from './filter'
import { withDrawer } from './Drawer'
import { withRouter } from 'react-router-dom'
import { dateToDay } from '../../util/time/day'

const composer = props => {
  const allAvailabilities = Availabilities.find({}, { sort: { start: 1 } }).fetch()
  const tags = Tags.find({}, { sort: { order: 1 } }).fetch()
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
    allAvailabilities,
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

const hover = (props) => {
  const hoverAvailability = props.hoverAvailability
    ? props.allAvailabilities.find(a => a._id === props.hoverAvailability)
    : ((idx(props, _ => _.results[0].availabilities) || idx(props, _ => _.results[0].assignees[0].availabilities)) || [])[0]

  return {
    ...props,
    hoverAvailability
  }
}

const handleAvailabilityClick = props => availabilityId => {
  console.log('Navigating to Availability', availabilityId)
  const availability = props.allAvailabilities.find(a => a._id === availabilityId)
  if (availability) {
    const calendar = props.calendars.find(c => c._id === availability.calendarId)
    const d = dateToDay(availability.from)
    const date = [d.year, d.month, d.day].join('-')
    const url = ['/appointments', calendar.slug, date].join('/')
    props.history.push(url)
    if (props.setOpen) {
      props.setOpen(false)
    }
  } else {
    throw new Error('Could not find availability')
  }
}

export const HelpContainerComponent = compose(
  withRouter,
  withTracker(composer),
  withProps(prepareAvailabilities),
  withState('searchValue', 'setSearchValue', ''),
  withHandlers({ handleSearchValueChange }),
  withState('hoverAvailability', 'setHoverAvailability'),
  withProps(applySearchFilter),
  withState('hoverTag', 'setHoverTag'),
  withTracker(hover),
  withState('isDrawerOpen', 'setDrawerOpen', false),
  withHandlers({
    handleAvailabilityClick,
    handleDrawerOpen: props => e => {
      props.setDrawerOpen(true)
      props.focusSearch()
    },
    handleDrawerClose: props => e =>
      props.setDrawerOpen(false)
  }),
  withDrawer
  // withProps(explodeConstraints),
  // log('exploded'),
  // withProps(combineConstraints),
  // log('combined')
)(Help)

export class HelpContainer extends React.Component {
  constructor (props) {
    super(props)
    this.focusSearch = this.focusSearch.bind(this)
  }

  focusSearch () {
    this.searchRef && this.searchRef.focus()
  }

  render () {
    return (
      <HelpContainerComponent
        {...this.props}
        focusSearch={this.focusSearch}
        searchRef={ref => { this.searchRef = ref }}
      />
    )
  }
}
