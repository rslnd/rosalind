import React from 'react'
import identity from 'lodash/identity'
import { compose, withState, withHandlers, withProps } from 'recompose'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import { Icon } from '../components/Icon'
import { withTracker } from '../components/withTracker'
import { Calendars } from '../../api/calendars'
import { __ } from '../../i18n'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'

const composer = props => {
  if (props.unfilteredPastAppointments.length <= 1) { return null }

  const countByCalendarId = props.unfilteredPastAppointments.reduce((acc, a) =>
    ({ ...acc, [a.calendarId]: (acc[a.calendarId] || 0) + 1 }),
  {})

  const calendarIds = Object.keys(countByCalendarId)

  if (calendarIds.length <= 1) { return null }

  const filterMenu = Calendars.find({ _id: {
    $in: calendarIds
  } }, { order: { order: 1 } }).fetch().map(c => ({
    ...c,
    count: countByCalendarId[c._id]
  }))

  return {
    ...props,
    filterMenu
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
    },
    filterRemoved: props => removed => e => props.setFilter({ ...props.filter, removed }),
    filterCalendarId: props => calendarId => e => props.setFilter({ ...props.filter, calendarId })
  }),
  withProps(props => {
    const options = [
      {
        name: 'Alle Termine',
        count: props.unfilteredPastAppointments.length,
        icon: 'search-plus',
        fn: props.filterCalendarId(null)
      },
      ...props.filterMenu.map(calendar => ({
        name: __('appointments.filterCalendar', { name: calendar.name }),
        count: calendar.count,
        icon: calendar.icon,
        fn: props.filterCalendarId(calendar._id)
      })),
      (props.canceledCount >= 1) && { divider: true },
      (props.canceledCount >= 1) && (
        props.filter.removed
          ? {
            name: 'Absagen verstecken',
            icon: 'times',
            count: props.canceledCount,
            fn: props.filterRemoved(false)
          }
          : {
            name: 'Absagen anzeigen',
            icon: 'times',
            muted: true,
            count: props.canceledCount,
            fn: props.filterRemoved(true)
          }
      )
    ].filter(identity)

    return { options }
  })
)(({
  anchor,
  options,
  handleOpen,
  handleClose
}) =>
  <>
    <div style={filterTabStyle} onClick={handleOpen}>
      <div style={filterStyle}>
        Alle Termine (36) <Icon name='caret-down' />
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
              key={o.name}
              onClick={() => { o.fn(); handleClose() }}
            >
              <Icon name={o.icon} style={o.muted ? iconStyleMuted : iconStyle} />
              {o.name} {o.count &&
                <ListItemSecondaryAction>
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
  // right: 39,
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

const iconStyle = {
  width: 28
}

const iconStyleMuted = {
  ...iconStyle,
  opacity: 0.3
}
