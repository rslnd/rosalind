import React from 'react'
import identity from 'lodash/identity'
import { compose, withState, withHandlers, withProps } from 'recompose'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import Checkbox from '@material-ui/core/Checkbox'
import Radio from '@material-ui/core/Radio'
import Typography from '@material-ui/core/Typography'
import { Icon } from '../components/Icon'
import { withTracker } from '../components/withTracker'
import { Calendars } from '../../api/calendars'
import { __ } from '../../i18n'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import { Meteor } from 'meteor/meteor'
import { Appointments } from '../../api'

const removeNullKeys = (filter, newPartialFilter) => {
  const key = Object.keys(newPartialFilter)[0]
  if (newPartialFilter[key] === null) {
    return Object.keys(filter).reduce((acc, existingKey) =>
      (existingKey === key)
        ? acc
        : ({
          ...acc,
          [existingKey]: filter[existingKey]
        })
    , {})
  } else {
    return {
      ...filter,
      ...newPartialFilter
    }
  }
}

const withFilters = ({ filter, setFilter, ...props }) =>
  filters(props).map((f) => {
    if (f.divider) { return f }

    const state = filter || {}

    return {
      ...f,
      toggle: () => setFilter(removeNullKeys(state, f.toggle(state))),
      count: f.count ? (props.otherAppointments || []).filter(a => f.count(a, state)).length : null,
      isChecked: !!f.isChecked(state)
    }
  })

const countRemoved = (a, state) =>
  state.removed
    ? true
    : !(a.removed || a.canceled)

const filters = ({ currentAppointment, calendars, userId, fullNameWithTitle }) => [
  {
    key: 'assigneeId',
    label: __('appointments.treatedByName', { name: fullNameWithTitle(userId) }),
    name: fullNameWithTitle(userId),
    toggle: state => ({ assigneeId: state.assigneeId ? null : userId }),
    isChecked: state => state.assigneeId === userId,
    count: (a, state) => countRemoved(a, state) && a.assigneeId === userId
  },
  {
    label: 'Absagen / Gelöscht',
    toggle: state => ({ removed: state.removed ? null : true }),
    isChecked: state => state.removed,
    count: a => (a.removed || a.canceled)
  },
  {
    divider: true
  },
  {
    key: 'calendarId',
    label: 'Alle Kalender',
    toggle: () => ({ calendarId: null }),
    isChecked: state => !state.calendarId,
    count: (a, state) => countRemoved(a, state),
    type: 'radio'
  },
  ...(calendars || []).map(c => ({
    key: 'calendarId',
    label: 'Nur ' + c.name,
    toggle: state => ({ calendarId: c._id }),
    isChecked: state => state.calendarId === c._id,
    count: (a, state) => countRemoved(a, state) && (a.calendarId === c._id),
    type: 'radio'
  }))
]

// HACK: Filter by same assignee by default if logged in as assignee
// Maybe the filter state should be persisted per user?
const defaultFilter = props =>
  Appointments.findOne({ assigneeId: props.userId })
    ? { assigneeId: props.userId }
    : null

const composer = props => {
  const userId = Meteor.userId()
  const calendars = Calendars.find().fetch()

  if (!props.filter) {
    props.setFilter(defaultFilter({ ...props, userId }))
  }

  return {
    ...props,
    userId,
    calendars
  }
}

export const Filter = compose(
  withTracker(composer),
  withState('anchor', 'setAnchor'),
  withHandlers({
    handleOpen: props => e =>
      props.setAnchor(e.currentTarget),
    handleClose: props => e => {
      props.setAnchor(null)
    }
  }),
  withProps(props => {
    const options = withFilters(props)

    const filteredCalendar = options.find(o => o.isChecked && o.key === 'calendarId')
    const filteredAssignee = options.find(o => o.isChecked && o.key === 'assigneeId')

    const filterLabel = [
      filteredCalendar && filteredCalendar.label,
      filteredAssignee && filteredAssignee.name
    ].filter(identity).join(', ')

    return {
      options,
      filterLabel
    }
  })
)(({
  anchor,
  options,
  handleOpen,
  handleClose,
  filterLabel
}) =>
  <>
    <div style={filterTabStyle} onClick={handleOpen}>
      <div style={filterStyle}>
        Filter: {filterLabel}&emsp;<Icon name='caret-down' />
      </div>
    </div>
    <Menu
      anchorEl={anchor}
      open={!!anchor}
      onClose={handleClose}
    >
      {
        options.map((o, i) =>
          o.divider
            ? <Divider key={i} />
            : <MenuItem
              style={menuItemStyle}
              key={o.label}
              onClick={() => { o.toggle(); handleClose() }}
            >
              {
                o.type === 'radio'
                  ? <Radio checked={o.isChecked} onChange={() => { o.toggle(); handleClose() }} />
                  : <Checkbox checked={o.isChecked} onChange={() => { o.toggle(); handleClose() }} />
              }

              <Typography variant='inherit'>
                {o.label}
              </Typography>

              {(o.count === 0 || o.count > 0) &&
                <ListItemSecondaryAction style={o.count === 0 ? countStyleZero : countStyle}>
                  {o.count}
                </ListItemSecondaryAction>
              }
            </MenuItem>
        )
      }
    </Menu>
  </>
)

const filterTabStyle = {
  position: 'absolute',
  left: 120,
  top: 0,
  opacity: 0.9,
  background: '#eef1f5',
  borderRadius: '0 0 5px 5px',
  border: '1px solid #a5b0c44a',
  pointerEvents: 'auto'
}

const filterStyle = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 6,
  paddingBottom: 6,
  fontSize: '90%',
  opacity: 0.9
}

const menuItemStyle = {
  minWidth: 350,
  width: '100%'
}

const countStyle = {
  pointerEvents: 'none',
  paddingRight: 16,
  paddingLeft: 25
}

const countStyleZero = {
  ...countStyle,
  opacity: 0.6
}
